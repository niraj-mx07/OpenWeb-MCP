import * as cheerio from "cheerio";

export async function searchDuckDuckGo(query) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; web-mcp-learn/1.0)",
        },
    });

    if (!response.ok) {
        throw new Error(`DuckDuckGo fetch failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    // Each result on the page lives in a div.result
    $(".result").each((_, el) => {
        const titleEl = $(el).find(".result__a");
        const title = titleEl.text().trim();
        const link = titleEl.attr("href");
        const snippet = $(el).find(".result__snippet").text().trim();

        if (title && link) {
            results.push({ title, url: link, snippet, engine: "duckduckgo" });
        }
    });

    return results;
}