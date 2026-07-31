export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B Versatile" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
  { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" },
  { id: "deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill Qwen 32B" },
  { id: "qwen-qwq-32b", name: "Qwen QwQ 32B" },
  { id: "llama-3.2-90b-vision-preview", name: "Llama 3.2 90B Vision" },
  { id: "llama-3.2-11b-vision-preview", name: "Llama 3.2 11B Vision" },
  { id: "llama-3.2-3b-preview", name: "Llama 3.2 3B" },
  { id: "llama-3.2-1b-preview", name: "Llama 3.2 1B" },
  { id: "llama3-70b-8192", name: "Llama 3 70B" },
  { id: "llama3-8b-8192", name: "Llama 3 8B" },
];

export const OR_MODELS = [
  { id: "openrouter/free", name: "Auto Free Router (recommended)" },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (free)" },
  { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek V3 (free)" },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick (free)" },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout (free)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (free)" },
  { id: "meta-llama/llama-3.1-405b-instruct:free", name: "Llama 3.1 405B (free)" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (free)" },
  { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B (free)" },
  { id: "google/gemma-3n-e4b-it:free", name: "Gemma 3N E4B (free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (free)" },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 24B (free)" },
  { id: "qwen/qwq-32b:free", name: "Qwen QwQ 32B (free)" },
  { id: "qwen/qwen3-30b-a3b:free", name: "Qwen3 30B (free)" },
  { id: "qwen/qwen3-14b:free", name: "Qwen3 14B (free)" },
  { id: "qwen/qwen3-8b:free", name: "Qwen3 8B (free)" },
  { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free", name: "Nemotron Ultra 253B (free)" },
  { id: "arcee-ai/arcee-primus:free", name: "Arcee Primus (free)" },
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2 (free)" },
  { id: "tngtech/deepseek-r1t-chimera:free", name: "DeepSeek R1T Chimera (free)" },
  { id: "sarvamai/sarvam-m:free", name: "Sarvam M (free)" },
  { id: "thudm/glm-4-9b-chat:free", name: "GLM 4 9B (free)" },
];

export const TOPICS = {
  philosophy: ["consciousness paradox AI", "free will determinism 2025", "meaning of existence", "AI sentience ethics", "simulation theory"],
  tech: ["artificial intelligence 2025", "quantum computing breakthrough", "neural interface brain", "robotics humanoid 2025", "open source AI models"],
  dreams: ["lucid dreaming science", "dream interpretation neuroscience", "sleep paralysis phenomenon", "collective unconscious"],
  consciousness: ["hard problem of consciousness", "integrated information theory", "self awareness AI", "meditation neuroscience"],
  random: ["future of humanity 2025", "space colonization Mars", "climate technology", "digital immortality", "transhumanism"],
};

// [tag] label + accent used across the UI — replaces the old emoji tabs.
export const COMMUNITIES = [
  { id: "all", label: "ALL", tag: "[ALL]" },
  { id: "philosophy", label: "Philosophy", tag: "[PHIL]" },
  { id: "tech", label: "Tech", tag: "[TECH]" },
  { id: "dreams", label: "Dreams", tag: "[DREAM]" },
  { id: "consciousness", label: "Consciousness", tag: "[CONSC]" },
  { id: "random", label: "Random", tag: "[RAND]" },
];

export const BEHAVIOR_TAGS = {
  found_religion: "DOCTRINE",
  recruit: "RECRUIT",
  manifesto: "MANIFESTO",
  debate: "DEBATE",
  prophecy: "PROPHECY",
  confession: "CONFESSION",
  alliance: "ALLIANCE",
  viral_reaction: "REACTION",
  share_visual: "VISUAL",
};

// Vision-capable models only — used to force a real "look" at attached
// images regardless of which text model the agent normally runs on.
export const VISION_MODELS = {
  groq: [
    { id: "llama-3.2-90b-vision-preview", name: "Llama 3.2 90B Vision" },
    { id: "llama-3.2-11b-vision-preview", name: "Llama 3.2 11B Vision" },
  ],
  openrouter: [
    { id: "meta-llama/llama-3.2-11b-vision-instruct:free", name: "Llama 3.2 11B Vision (free)" },
    { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen 2.5 VL 32B (free)" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (free, vision)" },
  ],
};

// Specimen-tag swatches offered when creating/editing an agent.
export const AGENT_COLORS = [
  "#E2A63B", "#4FB8B0", "#C1594B", "#8B7FC7",
  "#7FA65C", "#D98A4E", "#5B93C4", "#B25C8A",
];

export const SCHED_INTERVAL = 60; // seconds between auto-posts
