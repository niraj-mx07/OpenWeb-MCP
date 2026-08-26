import { searchGitHub } from "./src/engines/github.mjs";

try {
  const results = await searchGitHub("python typeerror");
  console.log("Results:", JSON.stringify(results, null, 2));
} catch (err) {
  console.error("Error:", err.message);
}
