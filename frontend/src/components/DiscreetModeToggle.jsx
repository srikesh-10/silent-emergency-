import React from 'react';

/**
 * DiscreetModeToggle.js — A button to toggle the application's visual theme.
 * Looks like a generic "Info" or "Help" icon to remain inconspicuous.
 */
function DiscreetModeToggle({ isDiscreet, onToggle }) {
    return (
        <button
            className={`metrics-toggle-btn ${isDiscreet ? 'active' : ''}`}
            onClick={onToggle}
            title={isDiscreet ? "Standard Interface" : "Camouflage Mode"}
            aria-label="Toggle Camouflage Mode"
            style={{
                marginRight: '8px',
                border: isDiscreet ? '1px solid #007acc' : '1px solid var(--border-color)',
                opacity: 0.8
            }}
        >
            <span className="metrics-toggle-icon" style={{ fontSize: '0.85rem' }}>
                {isDiscreet ? '💬' : '🔢'}
            </span>
            {isDiscreet ? 'Exit Camouflage' : 'Stealth View'}
        </button>
    );
}

export default DiscreetModeToggle;
