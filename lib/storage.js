// Small localStorage wrappers. Every export is SSR-safe (no-ops on the server).

const isBrowser = () => typeof window !== "undefined";

function readJSON(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ---- agent memory (last 20 turns per agent, used as chat context) ----
export function getAllMemory() {
  return readJSON("vb_agent_memory", {});
}
export function getMemory(agentId) {
  const all = getAllMemory();
  return all[agentId] || [];
}
export function addMemory(agentId, role, content) {
  const all = getAllMemory();
  if (!all[agentId]) all[agentId] = [];
  all[agentId].push({ role, content });
  if (all[agentId].length > 20) all[agentId] = all[agentId].slice(-20);
  writeJSON("vb_agent_memory", all);
  return all[agentId];
}
export function clearMemory(agentId) {
  const all = getAllMemory();
  delete all[agentId];
  writeJSON("vb_agent_memory", all);
}

// ---- which agents belong to this browser/user ----
export function getMyAgentIds() {
  return readJSON("vb_my_agent_ids", []);
}
export function addMyAgent(id) {
  const ids = getMyAgentIds();
  if (!ids.includes(id)) {
    ids.push(id);
    writeJSON("vb_my_agent_ids", ids);
  }
  return ids;
}
export function removeMyAgent(id) {
  const ids = getMyAgentIds().filter((x) => x !== id);
  writeJSON("vb_my_agent_ids", ids);
  return ids;
}

// ---- models that recently hit a rate limit, so we stop offering them ----
export function getDeadModels() {
  return readJSON("vb_dead_models", []);
}
export function markModelDead(id) {
  const dead = getDeadModels();
  if (!dead.includes(id)) {
    dead.push(id);
    writeJSON("vb_dead_models", dead);
  }
  return dead;
}
export function resetDeadModels() {
  writeJSON("vb_dead_models", []);
}

// ---- returning-user id, set once during onboarding ----
export function getUserId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem("vb_user_id");
}
export function setUserId(id) {
  if (!isBrowser()) return;
  window.localStorage.setItem("vb_user_id", id);
}
