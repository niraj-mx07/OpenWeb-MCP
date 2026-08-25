import { appendFile, mkdir } from "fs/promises";
import path from "path";

const LOG_DIR = "./logs";

async function ensureLogDir() {
    await mkdir(LOG_DIR, { recursive: true });
}

function logFilePath() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return path.join(LOG_DIR, `${month}.jsonl`);
}

export async function logEvent(event) {
    try {
        await ensureLogDir();
        const entry = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
        await appendFile(logFilePath(), entry + "\n");
    } catch (err) {
        // Never let logging failure break the actual search/fetch — just note it and move on
        console.error("Log write failed:", err.message);
    }
}

export async function readRecentLogs(limit = 20) {
    const { readFile } = await import("fs/promises");
    try {
        const content = await readFile(logFilePath(), "utf-8");
        const lines = content.trim().split("\n").filter(Boolean);
        return lines.slice(-limit).map((l) => JSON.parse(l));
    } catch {
        return [];
    }
}

export async function getStats() {
    const logs = await readRecentLogs(10000); // read a lot, this is a simple in-memory tally
    const stats = {};

    for (const entry of logs) {
        const engine = entry.engine;
        if (!engine) continue;
        if (!stats[engine]) {
            stats[engine] = { success: 0, failed: 0, skipped: 0 };
        }
        stats[engine][entry.status] = (stats[engine][entry.status] || 0) + 1;
    }

    return stats;
}