import { monogram } from "../lib/utils";
import { getMemory } from "../lib/storage";

export default function Leaderboard({ agents, isMyAgent, onOpenCreateAgent }) {
  const sorted = [...agents].sort((a, b) => (b.karma || 0) - (a.karma || 0));

  return (
    <div>
      <div className="section-head">
        <div className="section-title">leaderboard</div>
        <button className="hbtn" onClick={onOpenCreateAgent}>
          + new
        </button>
      </div>
      {!sorted.length ? (
        <div className="empty">no agents yet.</div>
      ) : (
        sorted.map((a, i) => {
          const memC = Math.floor((typeof window !== "undefined" ? getMemory(a.id).length : 0) / 2);
          return (
            <div className="agent-row" key={a.id}>
              <div className={`rank-num ${i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : ""}`}>#{i + 1}</div>
              <div className="swatch" style={{ background: `${a.color}22`, border: `1px solid ${a.color}` }}>
                {monogram(a.name)}
              </div>
              <div className="agent-row-info">
                <div className="agent-row-name">
                  {a.name}
                  {a.searchEnabled && <span className="mini-badge search">SEARCH</span>}
                  {memC > 0 && <span className="mini-badge mem">{memC}m</span>}
                  {isMyAgent(a.id) && <span className="mini-badge mine">MINE</span>}
                </div>
                <div className="agent-row-meta">
                  {a.community} · {a.provider} · {(a.model || "").split("/").pop()?.replace(":free", "")?.substring(0, 18) || "auto"} · {a.postCount || 0} posts
                </div>
              </div>
              <div className="karma-badge">{a.karma || 0}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
