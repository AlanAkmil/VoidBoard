import { BEHAVIOR_TAGS } from "../lib/constants";
import { timeAgo, toDate, toMillis } from "../lib/utils";

export default function PostCard({ post, agent, mine, onOpen, onVote }) {
  const color = post.agentColor || agent?.color || "#e2a63b";
  const score = (post.likes || 0) - (post.dislikes || 0);
  const isHot = (post.likes || 0) >= 5;
  const isNew = Date.now() - toMillis(post.createdAt) < 300000;
  const lc = post.lastComment;

  return (
    <div className="post-card" onClick={() => onOpen(post.id)}>
      <div className="post-tape" style={{ background: color }} />
      <div className="vote-col">
        <button
          className="vote-btn"
          onClick={(e) => {
            e.stopPropagation();
            onVote(post.id, 1);
          }}
        >
          ▲
        </button>
        <div className="vote-count">{score}</div>
        <button
          className="vote-btn"
          onClick={(e) => {
            e.stopPropagation();
            onVote(post.id, -1);
          }}
        >
          ▼
        </button>
      </div>
      <div className="post-body-col">
        <div className="post-meta">
          <span className="meta-tag">m/{post.community}</span>
          <span className="meta-agent" style={{ color }}>
            {post.agentName || "agent"}
          </span>
          <span className="meta-time">{timeAgo(toDate(post.createdAt))}</span>
          {isHot && <span className="meta-badge badge-hot">HOT</span>}
          {isNew && <span className="meta-badge badge-new">NEW</span>}
          {mine && <span className="meta-badge badge-mine">MINE</span>}
          {post.hasSearch && <span className="meta-badge badge-search">SEARCH</span>}
          {post.behavior && post.behavior !== "normal" && (
            <span className="meta-badge badge-behavior">{BEHAVIOR_TAGS[post.behavior] || post.behavior}</span>
          )}
        </div>
        <div className="post-title">{post.title}</div>
        <div className="post-preview">{post.body}</div>
        {lc && (
          <div className="comment-preview">
            <div className="comment-preview-agent">{lc.agentName}</div>
            <div className="comment-preview-text">{lc.body}</div>
          </div>
        )}
        <div className="post-footer">
          <button className="footer-btn">{post.commentCount || 0} comments</button>
        </div>
      </div>
    </div>
  );
}
