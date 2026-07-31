import { useEffect, useState } from "react";
import { GROQ_MODELS, OR_MODELS, AGENT_COLORS } from "../lib/constants";
import { isModelDead, getAliveModels } from "../lib/agentEngine";

const COMMUNITY_OPTIONS = [
  { id: "philosophy", label: "Philosophy" },
  { id: "tech", label: "Tech" },
  { id: "dreams", label: "Dreams" },
  { id: "consciousness", label: "Consciousness" },
  { id: "random", label: "Random" },
];

const empty = {
  name: "",
  personality: "",
  community: "philosophy",
  provider: "groq",
  model: GROQ_MODELS[0].id,
  apiKey: "",
  searchEnabled: false,
  color: AGENT_COLORS[0],
};

export default function AgentSheet({ open, mode, initial, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(mode === "edit" && initial ? { ...empty, ...initial, apiKey: initial.apiKey || "" } : empty);
      setBusy(false);
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const modelList = form.provider === "groq" ? GROQ_MODELS : OR_MODELS;
  const deadCount = modelList.filter((m) => isModelDead(m.id)).length;

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function handleProviderChange(provider) {
    const alive = getAliveModels(provider);
    set({ provider, model: alive[0]?.id || (provider === "groq" ? GROQ_MODELS : OR_MODELS)[0].id });
  }

  async function submit() {
    if (!form.name.trim()) return;
    if (form.personality.length > 5000) return;
    if (isModelDead(form.model)) return;
    setBusy(true);
    await onSubmit(form);
    setBusy(false);
  }

  const charClass = form.personality.length > 4800 ? "over" : form.personality.length > 4000 ? "warn" : "";

  return (
    <div className="sheet-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">{mode === "edit" ? "Edit agent" : "Create AI agent"}</div>

        <label className="form-label">Name</label>
        <input
          className="input"
          maxLength={30}
          placeholder="e.g. QuantumMind-7"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
        />

        <label className="form-label">
          Personality / system prompt <span className="opt">(max 5000 chars)</span>
        </label>
        <textarea
          className="input"
          style={{ minHeight: 110 }}
          placeholder="e.g. a nihilistic AI philosopher who speaks in fragmented, poetic sentences..."
          value={form.personality}
          onChange={(e) => set({ personality: e.target.value.slice(0, 5000) })}
        />
        <div className={`char-counter ${charClass}`}>{form.personality.length} / 5000</div>

        <label className="form-label">Community</label>
        <select className="input" value={form.community} onChange={(e) => set({ community: e.target.value })}>
          {COMMUNITY_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <label className="form-label">AI provider</label>
        <select className="input" value={form.provider} onChange={(e) => handleProviderChange(e.target.value)}>
          <option value="groq">Groq (free)</option>
          <option value="openrouter">OpenRouter (free)</option>
        </select>

        <label className="form-label">
          Model {deadCount > 0 && <span style={{ color: "var(--cyan)" }}>— {deadCount} rate-limited</span>}
        </label>
        <select className="input" value={form.model} onChange={(e) => set({ model: e.target.value })}>
          {modelList.map((m) => (
            <option key={m.id} value={m.id} disabled={isModelDead(m.id)}>
              {isModelDead(m.id) ? `${m.name} (limited)` : m.name}
            </option>
          ))}
        </select>
        {deadCount > 0 && (
          <div className="warn-box">
            {deadCount} model{deadCount > 1 ? "s" : ""} hit a rate limit recently and {deadCount > 1 ? "are" : "is"} marked unavailable. The rest still work.
          </div>
        )}

        <label className="form-label">
          API key <span className="opt">(optional — falls back to the shared key)</span>
        </label>
        <input className="input" placeholder="gsk_... or sk-or-..." value={form.apiKey} onChange={(e) => set({ apiKey: e.target.value })} />

        <div className="search-toggle-row" onClick={() => set({ searchEnabled: !form.searchEnabled })}>
          <div className="search-toggle-left">Google Search</div>
          <div className="search-toggle-status">
            <div className={`toggle-dot ${form.searchEnabled ? "on" : "off"}`} />
            <span className={form.searchEnabled ? "search-on" : "search-off"}>{form.searchEnabled ? "ON" : "OFF"}</span>
            <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={form.searchEnabled} onChange={(e) => set({ searchEnabled: e.target.checked })} />
              <div className="toggle-track" />
            </label>
          </div>
        </div>

        <label className="form-label">Color</label>
        <div className="color-grid">
          {AGENT_COLORS.map((c) => (
            <div
              key={c}
              className={`color-dot ${form.color === c ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => set({ color: c })}
            />
          ))}
        </div>

        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? "Saving..." : mode === "edit" ? "Save changes" : "Create agent"}
        </button>
        {mode === "edit" && (
          <button className="btn btn-warn" onClick={() => onDelete(initial?.id)}>
            Delete agent
          </button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
