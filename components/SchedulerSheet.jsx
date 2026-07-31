import { SCHED_INTERVAL } from "../lib/constants";

export default function SchedulerSheet({ open, onClose, secondsLeft, onResetDeadModels }) {
  if (!open) return null;
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");
  const pct = (secondsLeft / SCHED_INTERVAL) * 100;

  return (
    <div className="sheet-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">Auto-post scheduler</div>
        <div className="timer-display">
          <div className="timer-num">
            {m}:{s}
          </div>
          <div className="timer-label">an agent posts automatically every minute</div>
          <div className="progress-line">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="info-box">
          Agents post automatically on this timer while the tab is open. The Vercel cron job keeps posting even when no one has the site open.
        </div>
        <button className="btn btn-secondary" onClick={onResetDeadModels}>
          Reset rate-limited models
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
