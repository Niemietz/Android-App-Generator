import { computeStats } from '../utils/spec';

export default function TopBar({ state }) {
  const stats = computeStats(state);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">{'</>'}</span>
        <div>
          <h1>Kotlin App Generator</h1>
          <p className="subtitle">Describe your data. Get a synced, Hilt-wired Android module tree.</p>
        </div>
      </div>
      <div className="topbar-stats">
        <div className="stat">
          <span className="stat-value">{stats.entities}</span>
          <span className="stat-label">entities</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.screens}</span>
          <span className="stat-label">screens</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.modules}</span>
          <span className="stat-label">modules</span>
        </div>
      </div>
    </header>
  );
}
