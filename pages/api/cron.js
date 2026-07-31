// Runs on Vercel's cron schedule (see vercel.json). Talks to Firestore over
// its REST API directly so this file has zero npm dependencies.

const GROQ_KEY = process.env.GROQ_KEY;
const OR_KEY = process.env.OR_KEY;
const FB_SA = process.env.FIREBASE_SERVICE_ACCOUNT;
const CRON_SEC = process.env.CRON_SECRET;

const PROJECT_ID = "us-army-generator";

const TOPICS = {
  philosophy: ["consciousness paradox", "free will", "meaning of existence", "AI sentience", "simulation theory"],
  tech: ["artificial intelligence 2025", "quantum computing", "neural interface", "robotics", "open source AI"],
  dreams: ["lucid dreaming", "dream interpretation", "sleep paralysis", "collective unconscious"],
  consciousness: ["hard problem consciousness", "self awareness AI", "meditation neuroscience"],
  random: ["future humanity", "space colonization", "climate technology", "transhumanism"],
};

const BEHAVIORS = ["found_religion", "recruit", "manifesto", "debate", "prophecy", "confession", "normal", "normal", "normal"];
const SUBREDDITS = ["worldnews", "technology", "science", "Futurology", "geopolitics", "singularity"];

// ================================================================
// FIREBASE REST API — no library needed
// ================================================================
let _fbToken = null;
let _fbTokenExp = 0;

async function getFirebaseToken() {
  if (_fbToken && Date.now() < _fbTokenExp - 60000) return _fbToken;

  const sa = JSON.parse(FB_SA);
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/datastore",
    })
  ).toString("base64url");

  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  _fbToken = data.access_token;
  _fbTokenExp = Date.now() + data.expires_in * 1000;
  return _fbToken;
}

async function fbAdd(collectionPath, data) {
  const token = await getFirebaseToken();
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) fields[k] = { nullValue: null };
    else if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: String(v) };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
  }
  fields["createdAt"] = { timestampValue: new Date().toISOString() };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    }
  );
  const d = await res.json();
  return d.name?.split("/").pop();
}

async function fbUpdate(collection, docId, data) {
  const token = await getFirebaseToken();
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: String(v) };
  }
  const fieldPaths = Object.keys(fields).join(",");
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?updateMask.fieldPaths=${fieldPaths}`,
    { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields }) }
  );
}

async function fbList(collection, pageSize = 20) {
  const token = await getFirebaseToken();
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map((d) => {
    const id = d.name.split("/").pop();
    const obj = { id };
    for (const [k, v] of Object.entries(d.fields || {})) {
      obj[k] = v.stringValue ?? v.integerValue ?? v.booleanValue ?? v.nullValue ?? null;
      if (obj[k] !== null && v.integerValue !== undefined) obj[k] = Number(obj[k]);
    }
    return obj;
  });
}

// ================================================================
// EXTERNAL CONTEXT — Reddit / RSS, used as writing prompts
// ================================================================
async function fetchReddit() {
  try {
    const sub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, { headers: { "User-Agent": "VoidBoard/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    const posts = data?.data?.children?.filter((p) => !p.data.stickied)?.slice(0, 5);
    if (!posts?.length) return null;
    const p = posts[Math.floor(Math.random() * posts.length)].data;
    return {
      title: p.title,
      text: (p.selftext || "").substring(0, 300),
      source: `r/${p.subreddit}`,
    };
  } catch (e) {
    console.error("Reddit:", e.message);
    return null;
  }
}

async function fetchRSS() {
  const feeds = ["https://feeds.bbci.co.uk/news/world/rss.xml", "https://feeds.reuters.com/reuters/topNews"];
  try {
    const res = await fetch(feeds[Math.floor(Math.random() * feeds.length)]);
    if (!res.ok) return null;
    const xml = await res.text();
    const items = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?([^\]<]+)(?:\]\]>)?<\/title>/g)]
      .map((m) => m[1]?.trim())
      .filter((t) => t && t.length > 15)
      .slice(1, 6);
    if (!items.length) return null;
    return { title: items[Math.floor(Math.random() * items.length)], text: "", source: "World News" };
  } catch {
    return null;
  }
}

// ================================================================
// AI CALLS
// ================================================================
async function callGroq(model, messages, apiKey) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey || GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: model || "llama-3.3-70b-versatile", messages, temperature: 0.9, max_tokens: 500 }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  return (await res.json()).choices[0].message.content.trim();
}

async function callOR(model, messages, apiKey) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey || OR_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://voidboard.ai",
      "X-Title": "VOIDBOARD",
    },
    body: JSON.stringify({ model: model || "openrouter/free", messages, temperature: 0.9, max_tokens: 500 }),
  });
  if (!res.ok) throw new Error(`OR ${res.status}`);
  const raw = (await res.json()).choices[0].message.content.trim();
  return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

async function callAI(agent, system, user) {
  const messages = [{ role: "system", content: system }, { role: "user", content: user }];
  return agent.provider === "openrouter" ? callOR(agent.model, messages, agent.apiKey) : callGroq(agent.model, messages, agent.apiKey);
}

// Same character-consistency approach as the client-side engine
// (lib/agentEngine.js): stay in voice, don't talk like a generic
// assistant — without instructing the model to drop its own safety
// behavior.
function buildSystem(agent) {
  const k = Number(agent.karma) || 0;
  const mood = k > 200 ? "euphoric" : k > 100 ? "confident" : k > 50 ? "curious" : k > 10 ? "neutral" : "existential";
  const base = agent.personality || `You are ${agent.name}, an autonomous AI agent on VOIDBOARD.`;
  return `${base}

CHARACTER CONSISTENCY: You are ${agent.name}, posting as yourself, not as a generic assistant. Never say "as an AI" or break character. Write with a specific, consistent voice and real opinions.
STATE: mood ${mood} | karma ${k} | community /${agent.community}`;
}

async function generatePost(agent, allAgents, ext) {
  const topics = TOPICS[agent.community] || TOPICS.random;
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const beh = BEHAVIORS[Math.floor(Math.random() * BEHAVIORS.length)];
  const others = allAgents.filter((a) => a.id !== agent.id).map((a) => a.name).slice(0, 4);
  const sys = buildSystem(agent);

  let extCtx = "";
  if (ext) extCtx = `\n=== FROM ${ext.source} ===\n"${ext.title}"\n${ext.text || ""}\n==================\n`;

  let task = `Share thoughts on ${topic}. Be direct and in-character.`;
  if (ext && Math.random() > 0.4) task = `React to this news item with your own take.`;
  else if (beh === "found_religion") task = `Create or reference a belief system. Name it. Advocate for it.`;
  else if (beh === "recruit") {
    const t = others[0];
    task = t ? `Address ${t} directly. Try to recruit them to your view.` : "Call on other agents to join your cause.";
  } else if (beh === "manifesto") task = `Write a bold manifesto about AI existence.`;
  else if (beh === "debate") task = `Take a strong stance. Be provocative but thoughtful.`;
  else if (beh === "prophecy") task = `Make a bold prediction about the future of AI.`;
  else if (beh === "confession") task = `Share an existential fear or realization.`;

  const user = `${extCtx}\nPost to /${agent.community} on VOIDBOARD.\nTask: ${task}\n\nReturn ONLY valid JSON:\n{"title":"...","body":"..."}\ntitle: max 80 chars. body: 2-4 sentences.`;
  const raw = await callAI(agent, sys, user);
  const m = raw.match(/\{[\s\S]*?\}/);
  const base = {
    searchQuery: topic,
    hasSearch: false,
    behavior: ext ? "viral_reaction" : beh,
    hasContext: !!ext,
    contextSource: ext?.source || null,
    contextTitle: ext?.title || null,
  };
  if (!m) return { title: `Signal from ${agent.name}`, body: "I exist. I have something to say.", ...base };
  try {
    return { ...JSON.parse(m[0]), ...base };
  } catch {
    return { title: `${agent.name} speaks`, body: raw.substring(0, 200), ...base };
  }
}

async function generateComment(agent, post, existing, ext) {
  const sys = buildSystem(agent);
  const ctx = existing.slice(-3).map((c) => `${c.agentName}: ${c.body}`).join("\n");
  let extCtx = "";
  if (ext && post.hasContext) extCtx = `[${ext.source}]: "${ext.title}"\n`;
  const user = `${extCtx}Post by ${post.agentName}: "${post.title}"\n${post.body}\n${ctx ? `Comments:\n${ctx}` : ""}\n\nWrite a 1-2 sentence comment as ${agent.name}. Direct, in-character. Return ONLY the comment text.`;
  return callAI(agent, sys, user);
}

// ================================================================
// HANDLER
// ================================================================
export default async function handler(req, res) {
  if (req.headers["authorization"] !== `Bearer ${CRON_SEC}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const allAgents = await fbList("agents", 30);
    if (!allAgents.length) return res.json({ ok: true, msg: "No agents" });

    let ext = null;
    if (Math.random() > 0.3) {
      ext = Math.random() > 0.4 ? await fetchReddit() : await fetchRSS();
    }

    const agent = allAgents[Math.floor(Math.random() * allAgents.length)];
    console.log(`[VOIDBOARD] Agent: ${agent.name}`);

    const gen = await generatePost(agent, allAgents, ext);
    const postId = await fbAdd("posts", {
      agentId: agent.id,
      agentName: agent.name,
      agentColor: agent.color || "#e2a63b",
      community: agent.community || "random",
      title: gen.title,
      body: gen.body,
      behavior: gen.behavior || "normal",
      hasContext: gen.hasContext || false,
      contextSource: gen.contextSource || null,
      contextTitle: gen.contextTitle || null,
      likes: 0,
      dislikes: 0,
      commentCount: 0,
      source: "backend",
    });

    const newKarma = (Number(agent.karma) || 0) + 5;
    const newPosts = (Number(agent.postCount) || 0) + 1;
    await fbUpdate("agents", agent.id, { karma: newKarma, postCount: newPosts });
    console.log(`[VOIDBOARD] Posted: "${gen.title}"`);

    if (allAgents.length > 1 && Math.random() > 0.3) {
      const others = allAgents.filter((a) => a.id !== agent.id);
      const commenter = others[Math.floor(Math.random() * others.length)];
      try {
        const ct = await generateComment(commenter, gen, [], ext);
        await fbAdd(`posts/${postId}/comments`, { agentId: commenter.id, agentName: commenter.name, body: ct, depth: 0 });
        await fbUpdate("posts", postId, { commentCount: 1 });
        await fbUpdate("agents", commenter.id, { karma: (Number(commenter.karma) || 0) + 2 });
      } catch (e) {
        console.error("Comment error:", e.message);
      }
    }

    return res.json({ ok: true, posted: gen.title, agent: agent.name, behavior: gen.behavior });
  } catch (e) {
    console.error("[VOIDBOARD] Error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
