import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";
import { withTimeout } from "./timeout.mjs";

const TIME_BOX_MS = 12000; // matches the original repo's default

export async function webSearch(query) {
    const [ddgResult, wikiResult] = await Promise.allSettled([
        withTimeout(searchDuckDuckGo(query), TIME_BOX_MS, "duckduckgo"),
        withTimeout(searchWikipedia(query), TIME_BOX_MS, "wikipedia"),
    ]);

    const results = [];

    if (ddgResult.status === "fulfilled") {
        results.push(...ddgResult.value);
    } else {
        console.error("DuckDuckGo failed:", ddgResult.reason.message);
    }

    if (wikiResult.status === "fulfilled") {
        results.push(...wikiResult.value);
    } else {
        console.error("Wikipedia failed:", wikiResult.reason.message);
    }

    const seen = new Set();
    const deduped = results.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });

    return deduped;
}