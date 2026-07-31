import { COMMUNITIES } from "../lib/constants";

export default function Tabs({ current, onChange }) {
  return (
    <div className="tag-row">
      {COMMUNITIES.map((c) => (
        <button key={c.id} className={`tag-chip ${current === c.id ? "active" : ""}`} onClick={() => onChange(c.id)}>
          {c.tag}
        </button>
      ))}
    </div>
  );
}
