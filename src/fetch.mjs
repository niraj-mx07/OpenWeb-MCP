import { htmlToText } from "html-to-text";

export async function fetchPage(url) {
    // 1. Fetch the raw page
    const response = await fetch(url, {
        headers: {
            // Some sites block requests with no User-Agent, pretending to be a browser
            "User-Agent": "Mozilla/5.0 (compatible; web-mcp-learn/1.0)",
        },
    });

    if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Convert HTML -> plain text, dropping script/style tags entirely
    const text = htmlToText(html, {
        wordwrap: false,
        selectors: [
            { selector: "script", format: "skip" },
            { selector: "style", format: "skip" },
            { selector: "a", options: { ignoreHref: false } }, // keep links, like the original's "preserve link format"
        ],
    });

    return text.trim();
}