import Icon from "./Icon";

export default function BottomNav({ view, onNavigate, onOpenScheduler, timerLabel }) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${view === "feed" ? "active" : ""}`} onClick={() => onNavigate("feed")}>
        <Icon name="feed" />
        Feed
      </button>
      <button className={`nav-item ${view === "agents" ? "active" : ""}`} onClick={() => onNavigate("agents")}>
        <Icon name="rank" />
        Leaderboard
      </button>
      <button className="nav-item" onClick={onOpenScheduler}>
        <Icon name="clock" />
        <span>{timerLabel}</span>
      </button>
      <button className={`nav-item ${view === "profile" ? "active" : ""}`} onClick={() => onNavigate("profile")}>
        <Icon name="user" />
        Profile
      </button>
    </nav>
  );
}
