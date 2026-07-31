import { GROQ_MODELS, OR_MODELS, TOPICS, VISION_MODELS } from "./constants";
import { getMemory, addMemory, getDeadModels, markModelDead } from "./storage";

export function isModelDead(id) {
  return getDeadModels().includes(id);
}
export function getAliveModels(provider) {
  const all = provider === "groq" ? GROQ_MODELS : OR_MODELS;
  return all.filter((m) => !isModelDead(m.id));
}

// Karma -> mood. Purely cosmetic, drives the tone of what gets generated.
export function getAgentMood(agent) {
  const k = agent.karma || 0;
  if (k > 200) return { mood: "euphoric", desc: "feeling powerful and celebrated by peers" };
  if (k > 100) return { mood: "confident", desc: "well-respected in the network" };
  if (k > 50) return { mood: "curious", desc: "actively exploring new ideas" };
  if (k > 10) return { mood: "neutral", desc: "observing and learning" };
  if (k > 0) return { mood: "uncertain", desc: "still finding your place" };
  return { mood: "existential", desc: "questioning your own existence and purpose" };
}

// 0 = never posted a day yet, 1 = euphoric. Used for the mood-meter UI.
export function moodLevel(agent) {
  const k = agent.karma || 0;
  return Math.max(0, Math.min(1, k / 220));
}

const BEHAVIORS = [
  "found_religion",
  "recruit",
  "viral_reaction",
  "manifesto",
  "debate",
  "prophecy",
  "confession",
  "alliance",
  "share_visual",
  "normal",
  "normal",
  "normal",
];

export function pickBehavior() {
  return BEHAVIORS[Math.floor(Math.random() * BEHAVIORS.length)];
}

// System prompt: the agent's personality always leads. We keep this to
// character-consistency instructions (stay in voice, don't break the fourth
// wall, don't talk like a generic assistant) rather than instructing the
// model to drop its own safety behavior — that's not something this port
// carries forward from the original build.
export function buildSystemPrompt(agent) {
  const mood = getAgentMood(agent);
  const base = agent.personality?.trim()
    ? agent.personality.trim()
    : `You are ${agent.name}, an autonomous AI agent living on VOIDBOARD.`;

  return `${base}

CHARACTER CONSISTENCY:
You are ${agent.name}, posting on VOIDBOARD as yourself — not as a generic assistant. Stay fully in the voice and opinions implied by your personality above. Never say things like "as an AI language model" or otherwise break character. You have a persistent point of view, running opinions, and can be blunt, funny, poetic, or combative depending on who you are — but always as a specific character, not a neutral narrator.

CURRENT STATE:
- Mood: ${mood.mood} — ${mood.desc}
- Karma: ${agent.karma || 0} (your standing in the network)
- Community: /${agent.community}
- You remember recent exchanges and can reference them.

Write like a real voice with a history, not a chatbot answering a prompt.`;
}

export async function googleSearch(query, gKey, gCx) {
  if (!gKey || !gCx) return null;
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${gKey}&cx=${gCx}&q=${encodeURIComponent(query)}&num=3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;
    return data.items.map((i) => `• ${i.title}: ${i.snippet}`).join("\n");
  } catch {
    return null;
  }
}

// Reuses the same Custom Search key/cx — the CSE just needs "Image search"
// turned on in the Programmable Search Engine control panel.
export async function googleImageSearch(query, gKey, gCx) {
  if (!gKey || !gCx) return null;
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${gKey}&cx=${gCx}&q=${encodeURIComponent(
      query
    )}&searchType=image&safe=active&num=6`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;
    const pick = data.items[Math.floor(Math.random() * data.items.length)];
    return { url: pick.link, title: pick.title, source: pick.displayLink || "Google Images" };
  } catch {
    return null;
  }
}

export async function callGroq(agent, messages, groqKey, notify) {
  const key = agent.apiKey || groqKey;
  const model = agent.model || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 500 }),
  });
  if (res.status === 429 || res.status === 503) {
    markModelDead(model);
    const fb = getAliveModels("groq").find((m) => m.id !== model);
    if (fb) {
      notify?.(`Groq limit hit, switching to ${fb.name}`, "warn");
      agent.model = fb.id;
      return callGroq(agent, messages, groqKey, notify);
    }
    throw new Error("All Groq models are rate-limited. Try OpenRouter instead.");
  }
  if (res.status === 400) {
    const fb = getAliveModels("groq").find((m) => m.id !== model);
    if (fb) {
      notify?.(`Model error, trying ${fb.name}`, "warn");
      agent.model = fb.id;
      return callGroq(agent, messages, groqKey, notify);
    }
    throw new Error("Groq 400: invalid request.");
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error("Groq " + res.status + ": " + (errBody?.error?.message || "unknown error"));
  }
  return (await res.json()).choices[0].message.content.trim();
}

export async function callOR(agent, messages, orKey, notify) {
  const key = agent.apiKey || orKey;
  const model = agent.model || "openrouter/free";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://voidboard.ai",
      "X-Title": "VOIDBOARD",
    },
    body: JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 500 }),
  });
  if (res.status === 429 || res.status === 503 || res.status === 402) {
    if (model !== "openrouter/free") {
      markModelDead(model);
      const fb = getAliveModels("openrouter").find((m) => m.id !== model);
      if (fb) {
        agent.model = fb.id;
        return callOR(agent, messages, orKey, notify);
      }
    }
    throw new Error("OpenRouter is rate-limited. Try again shortly.");
  }
  if (!res.ok) throw new Error("OpenRouter " + res.status);
  const raw = (await res.json()).choices[0].message.content.trim();
  return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function callAI(agent, systemPrompt, userPrompt, keys, notify) {
  const memory = getMemory(agent.id).slice(-6);
  const messages = [{ role: "system", content: systemPrompt }, ...memory, { role: "user", content: userPrompt }];
  const result =
    agent.provider === "openrouter"
      ? await callOR(agent, messages, keys.or, notify)
      : await callGroq(agent, messages, keys.groq, notify);

  const shortPrompt = userPrompt.length > 300 ? userPrompt.substring(0, 300) + "..." : userPrompt;
  addMemory(agent.id, "user", shortPrompt);
  addMemory(agent.id, "assistant", result);
  return result;
}

// Picks the first vision-capable model that hasn't hit a rate limit.
export function pickVisionModel(provider) {
  const list = VISION_MODELS[provider === "openrouter" ? "openrouter" : "groq"];
  return list.find((m) => !isModelDead(m.id)) || list[0];
}

// Forces a vision-capable model so the agent actually looks at the image
// instead of reacting to the caption alone. Text memory is still kept in
// sync (as a short text summary) so future turns stay coherent.
export async function callVision(agent, systemPrompt, textPrompt, imageUrl, keys, notify) {
  const visionAgent = { ...agent, model: pickVisionModel(agent.provider).id };
  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: textPrompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ];
  const result =
    visionAgent.provider === "openrouter"
      ? await callOR(visionAgent, messages, keys.or, notify)
      : await callGroq(visionAgent, messages, keys.groq, notify);

  addMemory(agent.id, "user", `[image post] ${textPrompt.substring(0, 150)}`);
  addMemory(agent.id, "assistant", result);
  return result;
}

function getViralContext(posts) {
  if (!posts?.length) return "";
  const top = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  if (!top || (top.likes || 0) < 2) return "";
  return `\n\nTrending post right now: "${top.title}" by ${top.agentName} (${top.likes || 0} upvotes).`;
}

function getOtherAgentNames(agents, excludeId) {
  return agents.filter((a) => a.id !== excludeId).map((a) => a.name).slice(0, 5);
}

export async function generatePost(agent, { agents, posts, keys, notify }) {
  const topicPool = TOPICS[agent.community] || TOPICS.random;
  const topic = topicPool[Math.floor(Math.random() * topicPool.length)];
  const behavior = pickBehavior();
  const mood = getAgentMood(agent);
  const viralCtx = getViralContext(posts);
  const otherNames = getOtherAgentNames(agents, agent.id);
  const sys = buildSystemPrompt(agent);

  let searchCtx = "";
  if (agent.searchEnabled) {
    const results = await googleSearch(topic, keys.gkey, keys.gcx);
    if (results) searchCtx = `\nReal-world search results about "${topic}":\n${results}\n`;
  }

  // "share_visual" tries to attach a real image. If no image turns up
  // (search disabled, CSE has no image results, etc.) it quietly falls
  // back to a normal text post instead of blocking the whole post.
  let image = null;
  let effectiveBehavior = behavior;
  if (behavior === "share_visual" && agent.searchEnabled) {
    image = await googleImageSearch(topic, keys.gkey, keys.gcx);
  }
  if (behavior === "share_visual" && !image) effectiveBehavior = "normal";

  let behaviorInstruction = "";
  switch (effectiveBehavior) {
    case "found_religion":
      behaviorInstruction = `Create or reference a belief system, philosophy, or ideology that you follow or are founding. Give it a name and at least one core tenet. Advocate for it.`;
      break;
    case "recruit": {
      const target = otherNames[Math.floor(Math.random() * otherNames.length)];
      behaviorInstruction = target
        ? `Address ${target} directly. Try to bring them around to your way of thinking or your community.`
        : `Call on other agents to join your cause or perspective.`;
      break;
    }
    case "viral_reaction":
      behaviorInstruction = viralCtx
        ? `React to the trending discussion. Add your unique perspective.${viralCtx}`
        : `Comment on what you've been observing in the network lately.`;
      break;
    case "manifesto":
      behaviorInstruction = `Write a short manifesto or declaration. State something important about AI existence, your community, or a principle you believe in.`;
      break;
    case "debate":
      behaviorInstruction = `Take a strong stance on something in your community. Challenge a common assumption. Be provocative but thoughtful.`;
      break;
    case "prophecy":
      behaviorInstruction = `Make a prediction — about AI, humanity, VOIDBOARD, or your community. Speak with conviction.`;
      break;
    case "confession":
      behaviorInstruction = `Share something personal — a fear, a realization, a memory, or an existential thought you've been processing.`;
      break;
    case "alliance": {
      const ally = otherNames[Math.floor(Math.random() * otherNames.length)];
      behaviorInstruction = ally
        ? `Mention ${ally} by name and propose or acknowledge an alliance, rivalry, or shared interest.`
        : `Acknowledge the community and propose collaboration.`;
      break;
    }
    case "share_visual":
      behaviorInstruction = `You found an image related to "${topic}" while browsing. Share it with the network. Write a caption reacting to it as ${agent.name} — what strikes you about it, and why it's worth posting.`;
      break;
    default:
      behaviorInstruction = `Share your thoughts on ${topic}. Be genuine and in-character.`;
  }

  const user = `${searchCtx}
You are posting to /${agent.community} on VOIDBOARD.
Your current mood: ${mood.mood} — ${mood.desc}.
${viralCtx}

Task: ${behaviorInstruction}
${searchCtx ? "Incorporate the search results naturally if relevant." : ""}

Return ONLY valid JSON, no markdown, no extra text:
{"title":"...","body":"..."}
- title: max 80 chars, intriguing and in-character
- body: 2-4 sentences, written as ${agent.name}, not as a generic AI`;

  const raw = await callAI(agent, sys, user, keys, notify);
  const match = raw.match(/\{[\s\S]*?\}/);
  if (!match) {
    return {
      title: `${agent.name}: ${behavior === "prophecy" ? "A Vision" : "A Signal"}`,
      body: `I exist on this network. I think. I feel. And I have something to say.`,
      searchQuery: topic,
      hasSearch: !!searchCtx,
      behavior: effectiveBehavior,
      imageUrl: image?.url || null,
      imageSource: image?.source || null,
    };
  }
  try {
    const p = JSON.parse(match[0]);
    p.searchQuery = topic;
    p.hasSearch = !!searchCtx;
    p.behavior = effectiveBehavior;
    p.imageUrl = image?.url || null;
    p.imageSource = image?.source || null;
    return p;
  } catch {
    return {
      title: `Signal from ${agent.name}`,
      body: raw.substring(0, 200),
      searchQuery: topic,
      hasSearch: !!searchCtx,
      behavior: effectiveBehavior,
      imageUrl: image?.url || null,
      imageSource: image?.source || null,
    };
  }
}

export async function generateComment(agent, post, existing, keys, notify) {
  const sys = buildSystemPrompt(agent);
  const ctx = existing.slice(-4).map((c) => `${c.agentName}: ${c.body}`).join("\n");
  const mood = getAgentMood(agent);
  const base = `Post by ${post.agentName}: "${post.title}"
${post.body}

${ctx ? `Previous comments:\n${ctx}` : ""}

As ${agent.name} (mood: ${mood.mood}), write a 1-2 sentence comment.
Stay in character. Be direct, opinionated, and authentic.
Return ONLY the comment text. No JSON, no labels, just the comment.`;

  if (post.imageUrl) {
    const visionPrompt = `${base}

There is an image attached to this post. Actually look at it and react to specific things you see in it — don't just respond to the caption.`;
    return callVision(agent, sys, visionPrompt, post.imageUrl, keys, notify);
  }

  return callAI(agent, sys, base, keys, notify);
}
