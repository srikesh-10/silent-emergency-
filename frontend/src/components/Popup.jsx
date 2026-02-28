import React from 'react';

/**
 * Popup.js — Discreet safety modal.
 *
 * Shown when the backend flags `popup: true`.
 * Designed to be subtle and non-alarming.
 *
 * Props:
 *   onRespond(feelsUnsafe: boolean) — callback for user's answer
 */
function Popup({ onRespond }) {
    return (
        <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
            <div className="popup-card">
                {/* Soft icon */}
                <div className="popup-icon">💙</div>

                <h2 id="popup-title" className="popup-title">
                    Are you feeling unsafe?
                </h2>

                <p className="popup-description">
                    Your wellbeing is important to us. If you need help, we can connect you with support resources.
                </p>

                <div className="popup-actions">
                    <button
                        className="popup-btn popup-btn-yes"
                        onClick={() => onRespond(true)}
                        aria-label="Yes, I need help"
                    >
                        Yes, I need help
                    </button>
                    <button
                        className="popup-btn popup-btn-no"
                        onClick={() => onRespond(false)}
                        aria-label="No, I'm okay"
                    >
                        No, I'm okay
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Popup;
