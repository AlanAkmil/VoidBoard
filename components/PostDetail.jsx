import Icon from "./Icon";
import { timeAgo, toDate } from "../lib/utils";

export default function PostDetail({ post, agent, agents, comments, commentsLoading, onBack, onVote }) {
  if (!post) return null;
  const color = post.agentColor || agent?.color || "#e2a63b";
  const score = (post.likes || 0) - (post.dislikes || 0);

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <Icon name="back" />
        </button>
        <div className="detail-title-bar">{post.title}</div>
        <span className="mono" style={{ fontSize: ".68rem", color: "var(--dim)" }}>
          {comments.length} comments
        </span>
      </div>

      <div className="detail-content">
        <div className="post-meta" style={{ marginBottom: ".6rem" }}>
          <span className="meta-tag">m/{post.community}</span>
          <span className="meta-agent" style={{ color }}>
            {post.agentName}
          </span>
          <span className="meta-time">{timeAgo(toDate(post.createdAt))}</span>
        </div>
        {post.hasSearch && (
          <div className="search-context-box">
            based on a search for &ldquo;{post.searchQuery}&rdquo;
          </div>
        )}
        <div className="detail-post-title">{post.title}</div>
        {post.imageUrl && (
          <div className="post-image-wrap detail">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="" className="post-image" onError={(e) => (e.target.parentElement.style.display = "none")} />
            {post.imageSource && <div className="post-image-src">via {post.imageSource}</div>}
          </div>
        )}
        <div className="detail-post-body">{post.body}</div>
        <div className="detail-actions">
          <div className="detail-vote">
            <button className="dvote-btn" onClick={() => onVote(post.id, 1)}>
              ▲
            </button>
            <span className="dvote-count">{score}</span>
            <button className="dvote-btn" onClick={() => onVote(post.id, -1)}>
              ▼
            </button>
          </div>
        </div>
      </div>

      <div className="section-head" style={{ position: "sticky", top: "calc(var(--header-h) + 52px)" }}>
        <div className="section-title">comments</div>
      </div>

      {commentsLoading ? (
        <div className="loading-state">
          <div className="spinner" />
        </div>
      ) : !comments.length ? (
        <div className="empty" style={{ padding: "2rem" }}>
          no comments yet
        </div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className={`comment-item ${c.depth ? "d1" : ""}`}>
            <div className="comment-meta-row">
              <span className="comment-agent" style={{ color: agents.find((a) => a.id === c.agentId)?.color || "#4fb8b0" }}>
                {c.agentName}
              </span>
              <span className="comment-time">{timeAgo(toDate(c.createdAt))}</span>
            </div>
            <div className="comment-text">{c.body}</div>
          </div>
        ))
      )}
    </div>
  );
}
