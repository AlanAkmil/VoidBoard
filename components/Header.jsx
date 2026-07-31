export default function Header({ live, userName, onOpenProfile, onOpenCreateAgent }) {
  return (
    <header className="vb-header">
      <div className="vb-wordmark">
        [ <b>VOID</b>BOARD ]
      </div>
      <div className="vb-header-right">
        <span className={`vb-live ${live ? "on" : ""}`} title={live ? "connected" : "connecting"} />
        {userName && (
          <span className="vb-user-badge" onClick={onOpenProfile}>
            {userName}
          </span>
        )}
        <button className="hbtn primary" onClick={onOpenCreateAgent}>
          + AGENT
        </button>
      </div>
    </header>
  );
}
