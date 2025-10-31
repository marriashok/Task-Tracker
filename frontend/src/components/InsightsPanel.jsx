// frontend/src/components/InsightsPanel.jsx
import { useState, useEffect } from 'react';

function InsightsPanel({ apiUrl, tasksCount }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/insights`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Unable to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [tasksCount]);

  if (loading) {
    return (
      <div className="insights-panel">
        <h2>💡 Smart Insights</h2>
        <p className="insights-loading">Analyzing your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-panel">
        <h2>💡 Smart Insights</h2>
        <p className="insights-error">{error}</p>
        <button onClick={fetchInsights} className="btn btn-small">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      <h2>💡 Smart Insights</h2>
      
      <div className="insights-summary">
        <p className="summary-text">{insights?.summary}</p>
      </div>

      {insights?.metrics && (
        <div className="insights-metrics">
          <div className="metric-card">
            <div className="metric-value">{insights.metrics.totalOpen}</div>
            <div className="metric-label">Open Tasks</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{insights.metrics.dueSoonCount}</div>
            <div className="metric-label">Due This Week</div>
          </div>

          <div className="metric-card">
            <div className="metric-value danger">{insights.metrics.overdueCount}</div>
            <div className="metric-label">Overdue</div>
          </div>
        </div>
      )}

      {insights?.metrics?.priorityDistribution && insights.metrics.priorityDistribution.length > 0 && (
        <div className="priority-breakdown">
          <h3>Priority Breakdown</h3>
          <div className="priority-bars">
            {insights.metrics.priorityDistribution.map(item => (
              <div key={item.priority} className="priority-bar-item">
                <span className="priority-label">{item.priority}</span>
                <div className="priority-bar-container">
                  <div 
                    className={`priority-bar priority-${item.priority.toLowerCase()}`}
                    style={{ width: `${(item.count / insights.metrics.totalOpen) * 100}%` }}
                  ></div>
                </div>
                <span className="priority-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={fetchInsights} className="btn btn-small refresh-btn">
        🔄 Refresh Insights
      </button>
    </div>
  );
}

export default InsightsPanel;