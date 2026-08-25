import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";
import { withTimeout } from "./timeout.mjs";
import { isCoolingDown, setCooldown } from "./cooldown.mjs";
import { detectIntent } from "./intent.mjs";
import { logEvent } from "./log.mjs";


const TIME_BOX_MS = 5000;
const COOLDOWN_MS = 60000;

// Central registry: engine name -> its search function
const ENGINES = {
    duckduckgo: searchDuckDuckGo,
    wikipedia: searchWikipedia,
};

// Which engines to use per intent
const ROUTES = {
    code: ["duckduckgo"],          // no code-specific engine yet — Phase 3.5 adds github/stackoverflow
    academic: ["wikipedia", "duckduckgo"],
    news: ["duckduckgo"],
    general: ["duckduckgo", "wikipedia"],
};

async function runEngine(name, query) {
    if (isCoolingDown(name)) {
        console.error(`${name} is cooling down, skipping`);
        return [];
    }
    try {
        return await withTimeout(ENGINES[name](query), TIME_BOX_MS, name);
    } catch (err) {
        console.error(`${name} failed:`, err.message);
        setCooldown(name, COOLDOWN_MS);
        return [];
    }
}

export async function webSearch(query) {
    const intent = detectIntent(query);
    const enginesToUse = ROUTES[intent];

    const resultsPerEngine = await Promise.all(
        enginesToUse.map((name) => runEngine(name, query))
    );

    const results = resultsPerEngine.flat();

    const seen = new Set();
    return results.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });
}
async function runEngine(name, query) {
    if (isCoolingDown(name)) {
        console.error(`${name} is cooling down, skipping`);
        logEvent({ engine: name, status: "skipped", query });
        return [];
    }
    try {
        const results = await withTimeout(ENGINES[name](query), TIME_BOX_MS, name);
        logEvent({ engine: name, status: "success", query, resultCount: results.length });
        return results;
    } catch (err) {
        console.error(`${name} failed:`, err.message);
        setCooldown(name, COOLDOWN_MS);
        logEvent({ engine: name, status: "failed", query, error: err.message });
        return [];
    }
}