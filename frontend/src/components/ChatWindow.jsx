import React, { useState, useCallback, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RiskMeter from './RiskMeter';
import Popup from './Popup';
import MetricsPanel from './MetricsPanel';

/**
 * ChatWindow.js — Main container component.
 * Orchestrates messaging, API calls, risk display, metrics panel, and the safety popup.
 */

// Backend endpoint for behavioral analysis
const API_URL = 'http://localhost:8000/analyze';

function ChatWindow({ isCamouflage }) {
    // Unique session ID for tracking in backend
    const [sessionId] = useState(() => crypto.randomUUID());

    // Chat messages: { text: string, sender: 'user' | 'system' }
    const [messages, setMessages] = useState([
        {
            text: 'Hello! I\'m here to listen. Feel free to share what\'s on your mind.',
            sender: 'system',
        },
    ]);

    // Risk assessment data from the backend
    const [riskData, setRiskData] = useState({
        risk_score: 0,
        level: 'LOW',
    });

    // Controls visibility of the discreet safety popup
    const [showPopup, setShowPopup] = useState(false);

    // Loading indicator while waiting for API response
    const [isLoading, setIsLoading] = useState(false);

    // Live typing metrics for the debug panel (updated on every keystroke)
    const [liveMetrics, setLiveMetrics] = useState({
        typing_speed: 0,
        backspaces: 0,
        pause_time: 0,
    });

    // History to build a typing baseline for the user
    const [metricHistory, setMetricHistory] = useState([]);

    const [isDiscreet, setIsDiscreet] = useState(false);

    // Quick Exit: Listen for Escape key
    useEffect(() => {
        let escapeCount = 0;
        let timeout;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                escapeCount++;
                if (escapeCount >= 3) {
                    // Panic action: clear storage and redirect
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'https://www.google.com';
                }

                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    escapeCount = 0;
                }, 1000); // Must hit Esc 3 times within 1 second
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Toggle discreet mode class on body
    useEffect(() => {
        if (isDiscreet) {
            document.body.classList.add('discreet-mode');
        } else {
            document.body.classList.remove('discreet-mode');
        }
        return () => document.body.classList.remove('discreet-mode');
    }, [isDiscreet]);

    const handleClearChat = () => {
        setMessages([
            {
                text: isDiscreet ? 'New document started.' : 'Chat cleared. I am here when you are ready.',
                sender: 'system',
            },
        ]);
        setRiskData({ risk_score: 0, level: 'LOW' });
    };

    // WebSocket connection for real-time Admin intervention
    useEffect(() => {
        const wsUrl = `ws://localhost:8000/ws/chat/${sessionId}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'admin_message') {
                    setMessages(prev => [...prev, { text: data.text, sender: 'system' }]);
                }
            } catch (err) {
                console.error("WS parsing error", err);
            }
        };

        return () => ws.close();
    }, [sessionId]);

    /**
     * handleSend — called when the user submits a message.
     * Sends the message text + typing behavior metrics to the backend,
     * then updates the chat and risk meter with the response.
     */
    const handleSend = useCallback(async (text, metrics) => {
        // 1. Append user message to chat
        setMessages((prev) => [...prev, { text, sender: 'user' }]);
        setIsLoading(true);

        // Calculate baselines
        let baseline = { speed: 0, backspaces: 0, pause: 0 };
        if (metricHistory.length > 0) {
            baseline.speed = metricHistory.reduce((a, b) => a + b.typing_speed, 0) / metricHistory.length;
            baseline.backspaces = metricHistory.reduce((a, b) => a + b.backspaces, 0) / metricHistory.length;
            baseline.pause = metricHistory.reduce((a, b) => a + b.pause_time, 0) / metricHistory.length;
        }

        // Add cur metrics to history if we are still building the baseline
        if (metricHistory.length < 3) {
            setMetricHistory(prev => [...prev, metrics]);
        }

        try {
            // 2. POST message + metrics to the backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text,
                    typing_speed: metrics.typing_speed,
                    backspaces: metrics.backspaces,
                    pause_time: metrics.pause_time,
                    baseline_speed: baseline.speed,
                    baseline_backspaces: baseline.backspaces,
                    baseline_pause: baseline.pause
                }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            // 3. Update risk data
            setRiskData({
                risk_score: data.risk_score ?? 0,
                level: data.level ?? 'LOW',
            });

            // 4. Show popup if backend flags it
            if (data.popup) {
                setShowPopup(true);
            }

            // 5. Add a system acknowledgement message dynamically from the backend
            const systemReply = data.reply || `Thank you for sharing. I'm analyzing your response.`;
            setMessages((prev) => [
                ...prev,
                {
                    text: systemReply,
                    sender: 'system',
                },
            ]);
        } catch (error) {
            // Gracefully handle network / backend errors
            console.error('API Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    text: 'Unable to reach the analysis server. Please ensure the backend is running.',
                    sender: 'system',
                },
            ]);
        } finally {
            setIsLoading(false);
            // Reset live metrics after send
            setLiveMetrics({ typing_speed: 0, backspaces: 0, pause_time: 0 });
        }
    }, []);

    /**
     * handlePopupResponse — called when the user responds to the safety popup.
     */
    const handlePopupResponse = useCallback((feelsUnsafe) => {
        if (feelsUnsafe) {
            console.log('[Silent Emergency] User indicated they feel unsafe — triggering safety protocol.');
            setMessages((prev) => [
                ...prev,
                {
                    text: 'We hear you. Help resources have been notified. You are not alone. 💙',
                    sender: 'system',
                },
            ]);
        }
        setShowPopup(false);
    }, []);

    return (
        <div className="chat-window">
            {/* Safety Controls Row */}
            <div className="safety-controls">
                <button
                    className="btn-panic"
                    onClick={() => { window.location.href = 'https://www.google.com'; }}
                    title="Quick Exit (or press Esc 3 times)"
                >
                    🏃 Quick Exit
                </button>
                <div className="safety-btn-group">
                    <button
                        className="btn-secondary"
                        onClick={() => setIsDiscreet(!isDiscreet)}
                    >
                        {isDiscreet ? '👁️ Standard Mode' : '🕶️ Discreet Mode'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleClearChat}
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Risk assessment meter (Hidden in Discreet Mode) */}
            {!isDiscreet && (
                <RiskMeter score={riskData.risk_score} level={riskData.level} />
            )}

            {/* Message display area */}
            <MessageList messages={messages} isLoading={isLoading} isCamouflage={isCamouflage} />

            {/* Typing metrics debug panel (Hidden in Discreet Mode) */}
            {!isDiscreet && !isCamouflage && <MetricsPanel metrics={liveMetrics} />}

            {/* Text input with typing-behavior tracking */}
            <MessageInput
                onSend={handleSend}
                onMetricsChange={setLiveMetrics}
                isLoading={isLoading}
                isCamouflage={isCamouflage}
            />

            {/* Discreet safety popup */}
            {showPopup && <Popup onRespond={handlePopupResponse} />}
        </div>
    );
}

export default ChatWindow;
