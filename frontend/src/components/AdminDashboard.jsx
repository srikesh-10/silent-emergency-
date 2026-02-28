import React, { useState, useEffect, useCallback, useRef } from 'react';
import Login from './Login';

/**
 * AdminDashboard.js — Admin Risk Monitor page.
 *
 * Fetches alert data from GET http://localhost:8000/alerts every 5 seconds.
 * Displays a table of sessions with risk scores, levels, and status.
 * HIGH risk rows are highlighted in red.
 */

const ALERTS_URL = 'http://localhost:8000/admin/logs';

function AdminDashboard() {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wsStatus, setWsStatus] = useState('Disconnected');
    const [interventionText, setInterventionText] = useState({});
    const wsRef = useRef(null);

    /**
     * fetchAlerts — pulls the historical alert data from the backend.
     */
    const fetchAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(ALERTS_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    handleLogout();
                    throw new Error('Session expired');
                }
                throw new Error(`Server responded with ${response.status}`);
            }
            const data = await response.json();
            setAlerts(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Admin fetch error:', err);
            setError('Unable to fetch history. Ensure the server is running.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Main Effect: Fetch History + Connect WebSocket
    useEffect(() => {
        if (!token) return;

        // 1. Fetch initial logs
        fetchAlerts();

        // 2. Establish WebSocket
        const wsUrl = `ws://localhost:8000/ws/admin/logs?token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setWsStatus('Connected');
            setError(null);
        };

        ws.onmessage = (event) => {
            try {
                const newLog = JSON.parse(event.data);
                setAlerts((prev) => {
                    const exists = prev.find(a => a.session_id === newLog.session_id);
                    if (exists) {
                        return prev.map(a => a.session_id === newLog.session_id ? { ...a, ...newLog } : a);
                    }
                    return [newLog, ...prev];
                });
            } catch (e) {
                console.error('Error parsing WS message:', e);
            }
        };

        ws.onclose = () => {
            setWsStatus('Disconnected');
        };

        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setWsStatus('Error');
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [token, fetchAlerts]);

    const handleLogin = (newToken) => {
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        if (wsRef.current) wsRef.current.close();
    };

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    const handleStatusChange = async (sessionId, newStatus) => {
        try {
            await fetch(`http://localhost:8000/admin/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            setAlerts(prev => prev.map(a => a.session_id === sessionId ? { ...a, session_status: newStatus } : a));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendIntervention = async (sessionId) => {
        const text = interventionText[sessionId];
        if (!text) return;
        try {
            await fetch(`http://localhost:8000/admin/intervene`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, message: text })
            });
            setInterventionText(prev => ({ ...prev, [sessionId]: '' }));
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * getLevel — derives level string dynamically just in case it's missing from DB logs
     */
    const getLevel = (alert) => {
        if (alert.level) return alert.level;
        return (alert.risk_score || 0) > 60 ? 'HIGH' : (alert.risk_score || 0) > 40 ? 'MEDIUM' : 'LOW';
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
                        Real-time session monitoring via WebSockets
                    </p>
                </div>
                <div className="admin-header-right">
                    <span className={`ws-status ws-${wsStatus.toLowerCase()}`}>
                        <span className="ws-dot"></span> {wsStatus}
                    </span>
                    <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
                </div>
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
                                    <th>Latest Risk</th>
                                    <th>Level</th>
                                    <th>Session State</th>
                                    <th>Intervention</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert, index) => {
                                    const lvl = getLevel(alert);
                                    return (
                                        <tr key={alert.session_id || index} className={getRowClass(lvl)}>
                                            <td className="admin-cell-id" title={alert.session_id}>
                                                {alert.session_id ? alert.session_id.split('-')[0] + '...' : `Session-${index + 1}`}
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
                                                                        : (alert.risk_score ?? 0) <= 60
                                                                            ? '#ffd600'
                                                                            : '#ff1744',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`admin-level-badge admin-level-${lvl.toLowerCase()}`}>
                                                    {lvl}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={alert.session_status || 'ACTIVE'}
                                                    onChange={(e) => handleStatusChange(alert.session_id, e.target.value)}
                                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px', borderRadius: '4px' }}
                                                >
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                                                    <option value="RESOLVED">RESOLVED</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Send message..."
                                                        value={interventionText[alert.session_id] || ''}
                                                        onChange={(e) => setInterventionText(prev => ({ ...prev, [alert.session_id]: e.target.value }))}
                                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', maxWidth: '140px' }}
                                                    />
                                                    <button
                                                        onClick={() => handleSendIntervention(alert.session_id)}
                                                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Send
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
