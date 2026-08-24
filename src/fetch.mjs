import { htmlToText } from "html-to-text";

export async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; web-mcp-learn/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "a", options: { ignoreHref: false } },
    ],
  });

  return text.trim();
}
