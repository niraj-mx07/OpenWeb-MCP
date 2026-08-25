import { htmlToText } from "html-to-text";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; web-mcp-learn/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function toPlainText(html) {
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "a", options: { ignoreHref: false } },
    ],
  }).trim();
}

function toReadableText(html, url) {
  // jsdom needs a base URL to resolve relative links/images correctly
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    // Readability sometimes can't find a "main content" region (e.g. a homepage, not an article)
    throw new Error("Readability could not extract article content from this page");
  }

  // article.content is still HTML (article body only) — convert that to text too
  return {
    title: article.title,
    text: toPlainText(article.content),
  };
}

export async function fetchPage(url, mode = "text") {
  const html = await fetchHtml(url);

  if (mode === "readable") {
    return toReadableText(html, url);
  }

  // default: plain text mode
  return { text: toPlainText(html) };
}