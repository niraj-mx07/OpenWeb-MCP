import { searchDuckDuckGo } from "./engines/duckduckgo.mjs";

export async function webSearch(query) {
    const results = await searchDuckDuckGo(query);
    return results;
}