import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";
import { searchWikipedia } from "./engines/wikipedia.mjs";

export async function webSearch(query) {
    // Run both engines in parallel — allSettled so one failing doesn't kill the other
    const [ddgResult, wikiResult] = await Promise.allSettled([
        searchDuckDuckGo(query),
        searchWikipedia(query),
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

    // Dedupe by URL, in case both engines somehow return the same page
    const seen = new Set();
    const deduped = results.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
    });

    return deduped;
}