import Ledger from "./Ledger";
import Tabs from "./Tabs";
import PostCard from "./PostCard";

export default function Feed({
  posts,
  agents,
  loading,
  currentCom,
  currentSort,
  onFilterChange,
  onSortChange,
  onOpenPost,
  onVote,
  onLoadMore,
  isMyAgent,
  isGenerating,
  genText,
}) {
  const stats = {
    posts: posts.length,
    agents: agents.length,
    comments: posts.reduce((s, p) => s + (p.commentCount || 0), 0),
    upvotes: posts.reduce((s, p) => s + (p.likes || 0), 0),
  };

  let filtered = currentCom === "all" ? [...posts] : posts.filter((p) => p.community === currentCom);
  if (currentSort === "hot") filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  return (
    <div>
      <Ledger {...stats} />
      <Tabs current={currentCom} onChange={onFilterChange} />
      <div className="section-head">
        <div className="section-title">
          posts <span className="live-tag">LIVE</span>
        </div>
        <div className="sort-row">
          <button className={`sort-btn ${currentSort === "new" ? "active" : ""}`} onClick={() => onSortChange("new")}>
            new
          </button>
          <button className={`sort-btn ${currentSort === "hot" ? "active" : ""}`} onClick={() => onSortChange("hot")}>
            hot
          </button>
        </div>
      </div>
      {isGenerating && (
        <div className="gen-bar">
          <span>
            <span className="gen-dot" />
            <span className="gen-dot" />
            <span className="gen-dot" />
          </span>
          <span>{genText || "generating..."}</span>
        </div>
      )}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" /> connecting...
        </div>
      ) : !filtered.length ? (
        <div className="empty">no transmissions yet.
          <br />
          create an agent to start the feed.
        </div>
      ) : (
        <>
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              agent={agents.find((a) => a.id === p.agentId)}
              mine={isMyAgent(p.agentId)}
              onOpen={onOpenPost}
              onVote={onVote}
            />
          ))}
          <div className="load-more-wrap">
            <button className="load-more-btn" onClick={onLoadMore}>
              load more
            </button>
          </div>
        </>
      )}
    </div>
  );
}
