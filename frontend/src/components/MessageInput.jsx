import React, { useState, useRef, useCallback } from 'react';

/**
 * MessageInput.js — Captures user text and tracks typing behavior metrics.
 *
 * Metrics tracked:
 *   - typing_speed : words per minute
 *   - backspaces   : total backspace key presses
 *   - pause_time   : cumulative time gaps > 1 second between keystrokes (in seconds)
 *
 * Props:
 *   onSend(text, metrics): callback when user submits
 *   onMetricsChange(metrics): optional callback fired on every keystroke with live metrics
 *   isLoading: boolean — disables input while waiting for API
 */

// Pause threshold in milliseconds — gaps larger than this count as a "pause"
const PAUSE_THRESHOLD_MS = 1000;

function MessageInput({ onSend, onMetricsChange, isLoading }) {
    const [text, setText] = useState('');

    // Refs survive re-renders without triggering them — ideal for metric counters
    const backspaceCount = useRef(0);
    const pauseTime = useRef(0);           // accumulated pause time in ms
    const lastKeystrokeTime = useRef(null); // timestamp of the previous keystroke
    const typingStartTime = useRef(null);   // timestamp of the very first keystroke

    /**
     * handleKeyDown — intercepts every keypress.
     *  - Counts backspaces
     *  - Measures pauses between keystrokes
     *  - Records when the user started typing
     *  - Submits on Enter (without Shift)
     */
    const handleKeyDown = useCallback(
        (e) => {
            const now = Date.now();

            // Record the start of typing on the very first keystroke
            if (!typingStartTime.current) {
                typingStartTime.current = now;
            }

            // Count backspaces
            if (e.key === 'Backspace') {
                backspaceCount.current += 1;
            }

            // Calculate pause duration between consecutive keystrokes
            if (lastKeystrokeTime.current) {
                const gap = now - lastKeystrokeTime.current;
                if (gap > PAUSE_THRESHOLD_MS) {
                    pauseTime.current += gap;
                }
            }
            lastKeystrokeTime.current = now;

            // Emit live metrics to parent for the debug panel
            if (onMetricsChange) {
                const elapsed = typingStartTime.current
                    ? (now - typingStartTime.current) / 1000
                    : 0;
                const currentText = (e.target?.value || '').trim();
                const wc = currentText ? currentText.split(/\s+/).length : 0;
                const elapsedMin = elapsed / 60;
                const liveWpm = elapsedMin > 0 ? Math.round(wc / elapsedMin) : 0;
                onMetricsChange({
                    typing_speed: liveWpm,
                    backspaces: backspaceCount.current,
                    pause_time: Math.round((pauseTime.current / 1000) * 100) / 100,
                });
            }

            // Submit on Enter (allow Shift+Enter for newlines)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [text, isLoading]
    );

    /**
     * handleSubmit — calculates final metrics, sends to parent, and resets state.
     */
    const handleSubmit = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const now = Date.now();

        // Total duration from first keystroke to send (in seconds)
        const durationSec = typingStartTime.current
            ? (now - typingStartTime.current) / 1000
            : 0;

        // Words per minute — avoid division by zero
        const wordCount = trimmed.split(/\s+/).length;
        const durationMin = durationSec / 60;
        const typingSpeed = durationMin > 0 ? Math.round(wordCount / durationMin) : 0;

        // Pause time in seconds (rounded to 2 decimals)
        const pauseSec = Math.round((pauseTime.current / 1000) * 100) / 100;

        // Build the metrics payload
        const metrics = {
            typing_speed: typingSpeed,
            backspaces: backspaceCount.current,
            pause_time: pauseSec,
        };

        // Send to parent
        onSend(trimmed, metrics);

        // Reset everything for the next message
        setText('');
        backspaceCount.current = 0;
        pauseTime.current = 0;
        lastKeystrokeTime.current = null;
        typingStartTime.current = null;
    }, [text, isLoading, onSend]);

    return (
        <form className="message-input" onSubmit={(e) => e.preventDefault()}>
            <textarea
                id="chat-input"
                className="input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? 'Analyzing...' : 'Type your message...'}
                disabled={isLoading}
                rows={1}
                aria-label="Message input"
            />
            <button
                type="button"
                className="send-btn"
                onClick={handleSubmit}
                disabled={isLoading || !text.trim()}
                aria-label="Send message"
            >
                {isLoading ? (
                    <span className="send-spinner" />
                ) : (
                    /* Paper-plane icon via SVG */
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                )}
            </button>
        </form>
    );
}

export default MessageInput;
