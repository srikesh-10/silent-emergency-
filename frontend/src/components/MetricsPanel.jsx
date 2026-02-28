import React, { useState } from 'react';

/**
 * MetricsPanel.js — Toggleable debug panel showing live typing behavior metrics.
 *
 * Hidden by default. Toggled via a small "📊 Metrics" button.
 * Intended for demo/presentation purposes.
 *
 * Props:
 *   metrics: { typing_speed: number, backspaces: number, pause_time: number }
 */
function MetricsPanel({ metrics }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="metrics-panel-wrapper">
            {/* Toggle button */}
            <button
                className="metrics-toggle-btn"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-label="Toggle typing metrics panel"
            >
                <span className="metrics-toggle-icon">📊</span>
                {isOpen ? 'Hide Metrics' : 'Show Metrics'}
            </button>

            {/* Expandable panel */}
            {isOpen && (
                <div className="metrics-panel" role="region" aria-label="Typing metrics">
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <span className="metric-icon">⌨️</span>
                            <div className="metric-info">
                                <span className="metric-value">{metrics.typing_speed}</span>
                                <span className="metric-label">WPM</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <span className="metric-icon">⌫</span>
                            <div className="metric-info">
                                <span className="metric-value">{metrics.backspaces}</span>
                                <span className="metric-label">Backspaces</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <span className="metric-icon">⏸️</span>
                            <div className="metric-info">
                                <span className="metric-value">{metrics.pause_time}s</span>
                                <span className="metric-label">Pause Time</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetricsPanel;
