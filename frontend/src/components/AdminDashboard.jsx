import React, { useState, useEffect, useCallback } from 'react';

/**
 * AdminDashboard.js — Admin Risk Monitor page.
 *
 * Fetches alert data from GET http://localhost:8000/alerts every 5 seconds.
 * Displays a table of sessions with risk scores, levels, and status.
 * HIGH risk rows are highlighted in red.
 */

const ALERTS_URL = 'http://localhost:8000/alerts';
const REFRESH_INTERVAL_MS = 5000;

function AdminDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    /**
     * fetchAlerts — pulls the latest alert data from the backend.
     */
    const fetchAlerts = useCallback(async () => {
        try {
            const response = await fetch(ALERTS_URL);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data = await response.json();
            setAlerts(Array.isArray(data) ? data : []);
            setError(null);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Admin fetch error:', err);
            setError('Unable to connect to the backend. Ensure the server is running at localhost:8000.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch + auto-refresh every 5 seconds
    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    /**
     * getStatusLabel — derives a status label from the risk level.
     */
    const getStatusLabel = (level) => {
        if (level === 'HIGH') return 'Flagged';
        return 'Normal';
    };

    /**
     * getRowClass — returns a CSS class for row highlighting.
     */
    const getRowClass = (level) => {
        switch (level) {
            case 'HIGH':
                return 'admin-row-high';
            case 'MEDIUM':
                return 'admin-row-medium';
            default:
                return '';
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <h2 className="admin-title">🛡️ Admin Risk Monitor</h2>
                    <p className="admin-subtitle">
                        Real-time session monitoring &middot; Auto-refreshes every 5s
                    </p>
                </div>
                {lastUpdated && (
                    <span className="admin-last-updated">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="admin-error">
                    <span className="admin-error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading && !error && (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading alerts...</p>
                </div>
            )}

            {/* Table */}
            {!isLoading && !error && (
                <div className="admin-table-wrapper">
                    {alerts.length === 0 ? (
                        <div className="admin-empty">
                            <p>No active sessions to display.</p>
                        </div>
                    ) : (
                        <table className="admin-table" role="table">
                            <thead>
                                <tr>
                                    <th>Session ID</th>
                                    <th>Risk Score</th>
                                    <th>Risk Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert, index) => (
                                    <tr key={alert.session_id || index} className={getRowClass(alert.level)}>
                                        <td className="admin-cell-id">
                                            {alert.session_id || `Session-${index + 1}`}
                                        </td>
                                        <td>
                                            <div className="admin-score-bar-wrapper">
                                                <span className="admin-score-value">{alert.risk_score ?? 0}</span>
                                                <div className="admin-mini-bar">
                                                    <div
                                                        className="admin-mini-bar-fill"
                                                        style={{
                                                            width: `${Math.min(alert.risk_score ?? 0, 100)}%`,
                                                            backgroundColor:
                                                                (alert.risk_score ?? 0) <= 40
                                                                    ? '#00c853'
                                                                    : (alert.risk_score ?? 0) <= 70
                                                                        ? '#ffd600'
                                                                        : '#ff1744',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`admin-level-badge admin-level-${(alert.level || 'low').toLowerCase()}`}>
                                                {alert.level || 'LOW'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-status ${alert.level === 'HIGH' ? 'admin-status-flagged' : 'admin-status-normal'}`}>
                                                {getStatusLabel(alert.level)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
