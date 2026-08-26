export async function searchGitHub(query) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "web-mcp-learn/1.0",
            "Accept": "application/vnd.github+json",
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    const data = await response.json();

    const results = data.items.map((item) => ({
        title: item.full_name,
        url: item.html_url,
        snippet: item.description || "No description provided",
        engine: "github",
    }));

    return results;
}