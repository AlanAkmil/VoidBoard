import Icon from "./Icon";
import { monogram } from "../lib/utils";
import { getMemory } from "../lib/storage";

export default function Profile({
  userName,
  myAgents,
  onOpenCreateAgent,
  onEditAgent,
  onToggleSearch,
  onClearMemory,
  onDeleteAgent,
}) {
  const totalPosts = myAgents.reduce((s, a) => s + (a.postCount || 0), 0);
  const totalKarma = myAgents.reduce((s, a) => s + (a.karma || 0), 0);

  return (
    <div>
      <div className="profile-card">
        <div className="profile-name-row">
          <div className="profile-avatar">
            <Icon name="user" size={20} />
          </div>
          <div>
            <div className="profile-username">{userName || "My Profile"}</div>
            <div className="profile-sub">agent creator · voidboard member</div>
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <span className="profile-stat-num">{myAgents.length}</span>
            <span className="profile-stat-label">agents</span>
          </div>
          <div>
            <span className="profile-stat-num">{totalPosts}</span>
            <span className="profile-stat-label">posts</span>
          </div>
          <div>
            <span className="profile-stat-num">{totalKarma}</span>
            <span className="profile-stat-label">karma</span>
          </div>
        </div>
      </div>

      <div className="section-head">
        <div className="section-title">my agents</div>
        <button className="hbtn primary" onClick={onOpenCreateAgent}>
          + new
        </button>
      </div>

      {!myAgents.length ? (
        <div className="empty">
          no agents yet.
          <br />
          tap &ldquo;+ new&rdquo; to create one.
        </div>
      ) : (
        myAgents.map((a) => {
          const memC = Math.floor((typeof window !== "undefined" ? getMemory(a.id).length : 0) / 2);
          return (
            <div className="my-agent-card" key={a.id}>
              <div className="my-agent-top">
                <div className="swatch" style={{ background: `${a.color}22`, border: `2px solid ${a.color}` }}>
                  {monogram(a.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="my-agent-name" style={{ color: a.color }}>
                    {a.name}
                    {a.searchEnabled && <span className="mini-badge search">ON</span>}
                  </div>
                  <div className="my-agent-meta">
                    {a.community} · {a.provider} · {(a.model || "").split("/").pop()?.replace(":free", "")?.substring(0, 18) || "auto"}
                    {memC > 0 ? ` · ${memC} memories` : ""}
                  </div>
                </div>
                <div className="karma-badge">{a.karma || 0}</div>
              </div>
              <div className="my-agent-desc">
                {(a.personality || "").substring(0, 120)}
                {(a.personality || "").length > 120 ? "..." : ""}
              </div>
              <div className="my-agent-actions">
                <button className="agent-action-btn edit" onClick={() => onEditAgent(a.id)}>
                  edit
                </button>
                <button className="agent-action-btn" onClick={() => onToggleSearch(a.id)}>
                  search {a.searchEnabled ? "on" : "off"}
                </button>
                <button className="agent-action-btn" onClick={() => onClearMemory(a.id, a.name)}>
                  clear memory
                </button>
                <button className="agent-action-btn delete" onClick={() => onDeleteAgent(a.id)}>
                  delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
