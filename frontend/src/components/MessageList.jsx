import React, { useEffect, useRef } from 'react';

/**
 * MessageList.js — Displays chat messages with auto-scroll.
 *
 * Props:
 *   messages: Array<{ text: string, sender: 'user' | 'system' }>
 *   isLoading: boolean — shows a typing indicator when true
 */
function MessageList({ messages, isLoading }) {
    const bottomRef = useRef(null);

    // Auto-scroll to the latest message whenever the list updates
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="message-list" role="log" aria-live="polite">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`message ${msg.sender === 'user' ? 'message-user' : 'message-system'}`}
                >
                    {/* Avatar icon */}
                    <div className="message-avatar">
                        {msg.sender === 'user' ? '🧑' : '🤖'}
                    </div>

                    {/* Bubble */}
                    <div className="message-bubble">
                        <p>{msg.text}</p>
                    </div>
                </div>
            ))}

            {/* Typing indicator while waiting for API response */}
            {isLoading && (
                <div className="message message-system">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}

            {/* Invisible anchor to scroll to */}
            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;
