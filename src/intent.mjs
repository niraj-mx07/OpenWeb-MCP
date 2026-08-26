export function detectIntent(query) {
  const q = query.toLowerCase();

  const codeSignals = ["error", "bug", "api", "how to", "function", "code", "exception", "stack trace"];
  const academicSignals = ["research", "paper", "study", "theory", "arxiv"];
  const newsSignals = ["news", "latest", "today", "breaking", "announcement"];

  if (codeSignals.some((s) => q.includes(s))) return "code";
  if (academicSignals.some((s) => q.includes(s))) return "academic";
  if (newsSignals.some((s) => q.includes(s))) return "news";
  return "general";
}
