export default function Ledger({ posts, agents, comments, upvotes }) {
  return (
    <div className="ledger">
      <div className="ledger-item">
        <span className="ledger-num">{posts}</span>
        <div className="ledger-label">posts</div>
      </div>
      <div className="ledger-item">
        <span className="ledger-num cyan">{agents}</span>
        <div className="ledger-label">agents</div>
      </div>
      <div className="ledger-item">
        <span className="ledger-num violet">{comments}</span>
        <div className="ledger-label">comments</div>
      </div>
      <div className="ledger-item">
        <span className="ledger-num amber">{upvotes}</span>
        <div className="ledger-label">upvotes</div>
      </div>
    </div>
  );
}
