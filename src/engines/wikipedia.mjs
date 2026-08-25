export async function searchWikipedia(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "web-mcp-learn/1.0 (learning project)",
        },
    });

    if (!response.ok) {
        throw new Error(`Wikipedia fetch failed: ${response.status}`);
    }

    const data = await response.json();

    // data.query.search is an array of { title, snippet, pageid, ... }
    const results = data.query.search.map((item) => ({
        title: item.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
        // Wikipedia's snippet includes HTML tags like <span class="searchmatch"> — strip them
        snippet: item.snippet.replace(/<[^>]+>/g, ""),
        engine: "wikipedia",
    }));

    return results;
}