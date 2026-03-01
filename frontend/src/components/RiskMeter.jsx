import React from 'react';

/**
 * RiskMeter.js — Animated horizontal bar showing the current risk assessment.
 *
 * Props:
 *   score : number (0–100) — width of the filled bar
 *   level : 'LOW' | 'MEDIUM' | 'HIGH'
 *
 * Color mapping:
 *   0–40  → Green  (#00c853)
 *   40–70 → Amber  (#ffd600)
 *   70–100 → Red   (#ff1744)
 */

function getBarColor(score) {
    if (score <= 40) return '#00c853';
    if (score <= 70) return '#ffd600';
    return '#ff1744';
}

function getLevelClass(level) {
    switch (level) {
        case 'HIGH':
            return 'risk-high';
        case 'MEDIUM':
            return 'risk-medium';
        default:
            return 'risk-low';
    }
}

function RiskMeter({ score = 0, level = 'LOW' }) {
    const barColor = getBarColor(score);
    // Check if we are in camouflage mode by checking the parent class
    const isCamouflage = document.querySelector('.app')?.classList.contains('is-camouflage');

    return (
        <div className={`risk-meter ${level === 'HIGH' ? 'risk-pulse-active' : ''}`} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
            {/* Header row */}
            <div className="risk-meter-header">
                <span className="risk-label">{isCamouflage ? 'System Performance' : 'Aegis Intelligence'}</span>
                <span className={`risk-level-badge ${getLevelClass(level)}`}>
                    {isCamouflage ? (level === 'LOW' ? 'OPTIMAL' : level === 'MEDIUM' ? 'STRESSED' : 'CRITICAL') : level}
                </span>
            </div>

            {/* Bar track */}
            <div className="risk-bar-track">
                <div
                    className={`risk-bar-fill ${isCamouflage ? 'camo-bar' : ''}`}
                    style={{
                        width: `${Math.min(Math.max(score, 0), 100)}%`,
                        backgroundColor: isCamouflage ? '#007acc' : barColor,
                    }}
                />
            </div>

            {/* Score text */}
            <div className="risk-score-text">
                {isCamouflage ? 'Load Factor:' : 'Confidence:'} <strong>{score}%</strong>
            </div>
        </div>
    );
}

export default RiskMeter;
