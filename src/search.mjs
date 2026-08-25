import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";
import { withTimeout } from "./timeout.mjs";
import { isCoolingDown, setCooldown } from "./cooldown.mjs";

const TIME_BOX_MS = 5000;
const COOLDOWN_MS = 60000; // 60s, matches the original repo

async function runEngine(name, searchFn, query) {
    if (isCoolingDown(name)) {
        console.error(`${name} is cooling down, skipping`);
        return [];
    }
    try {
        return await withTimeout(searchFn(query), TIME_BOX_MS, name);
    } catch (err) {
        console.error(`${name} failed:`, err.message);
        setCooldown(name, COOLDOWN_MS);
        return [];
    }
}

export async function webSearch(query) {
    const [ddg, wiki] = await Promise.all([
        runEngine("duckduckgo", searchDuckDuckGo, query),
        runEngine("wikipedia", searchWikipedia, query),
    ]);

    const results = [...ddg, ...wiki];

    const seen = new Set();
    return results.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });
}