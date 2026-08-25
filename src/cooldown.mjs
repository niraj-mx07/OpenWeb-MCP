const cooldowns = new Map(); // engine name -> timestamp (ms) when it's usable again

export function isCoolingDown(engine) {
    const until = cooldowns.get(engine);
    if (!until) return false;
    return Date.now() < until;
}

export function setCooldown(engine, ms) {
    cooldowns.set(engine, Date.now() + ms);
}