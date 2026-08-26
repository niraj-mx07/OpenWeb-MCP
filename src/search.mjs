import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";
import { withTimeout } from "./timeout.mjs";
import { isCoolingDown, setCooldown } from "./cooldown.mjs";
import { detectIntent } from "./intent.mjs";
import { logEvent } from "./log.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";
import { searchGitHub } from "./engines/github.mjs";

const TIME_BOX_MS = 5000;
const COOLDOWN_MS = 60000;

const ENGINES = {
  duckduckgo: searchDuckDuckGo,
  wikipedia: searchWikipedia,
  github: searchGitHub,
};

const ROUTES = {
  code: ["duckduckgo"],
  academic: ["wikipedia", "duckduckgo"],
  news: ["duckduckgo"],
  general: ["duckduckgo", "wikipedia"],
};

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

export async function webSearch(query) {
  const intent = detectIntent(query);
  console.error(`Detected intent: ${intent}`);

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
