import React, { useState, useCallback } from 'react';
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

function ChatWindow() {
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

    /**
     * handleSend — called when the user submits a message.
     * Sends the message text + typing behavior metrics to the backend,
     * then updates the chat and risk meter with the response.
     */
    const handleSend = useCallback(async (text, metrics) => {
        // 1. Append user message to chat
        setMessages((prev) => [...prev, { text, sender: 'user' }]);
        setIsLoading(true);

        try {
            // 2. POST message + metrics to the backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    typing_speed: metrics.typing_speed,
                    backspaces: metrics.backspaces,
                    pause_time: metrics.pause_time,
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

            // 5. Add a system acknowledgement message
            setMessages((prev) => [
                ...prev,
                {
                    text: `Thank you for sharing. I'm analyzing your response.`,
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
            {/* Risk assessment meter */}
            <RiskMeter score={riskData.risk_score} level={riskData.level} />

            {/* Message display area */}
            <MessageList messages={messages} isLoading={isLoading} />

            {/* Typing metrics debug panel */}
            <MetricsPanel metrics={liveMetrics} />

            {/* Text input with typing-behavior tracking */}
            <MessageInput
                onSend={handleSend}
                onMetricsChange={setLiveMetrics}
                isLoading={isLoading}
            />

            {/* Discreet safety popup */}
            {showPopup && <Popup onRespond={handlePopupResponse} />}
        </div>
    );
}

export default ChatWindow;
