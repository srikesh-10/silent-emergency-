import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import DiscreetModeToggle from './components/DiscreetModeToggle';
import Calculator from './components/Calculator';

/**
 * App.js — Root component for Silent Emergency.
 * Uses React Router for navigation between Chat (/) and Admin (/admin).
 */
function App() {
    const [isDiscreet, setIsDiscreet] = useState(false);

    // Stealth & Panic Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Panic Redirect (Esc key)
            if (e.key === 'Escape') {
                window.location.href = 'https://www.google.com/search?q=weather+today';
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <BrowserRouter>
            <div className={`app ${isDiscreet ? 'discreet-mode' : ''}`}>

                {/* Header with navigation */}
                <header className="app-header">
                    <div className="header-inner">
                        <div className="logo">
                            <span className="logo-icon">💠</span>
                            <h1>Aegis</h1>
                        </div>

                        {/* Navigation links */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <DiscreetModeToggle
                                isDiscreet={isDiscreet}
                                onToggle={() => setIsDiscreet(!isDiscreet)}
                            />
                            <nav className="header-nav">
                                <NavLink
                                    to="/"
                                    end
                                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                                >
                                    Chat
                                </NavLink>
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                                >
                                    Admin
                                </NavLink>
                            </nav>
                        </div>

                        <span className="header-tag">Aegis AI Core</span>
                    </div>
                </header>


                {/* Route-based content */}
                <main className="app-main">
                    {isDiscreet ? (
                        <Calculator />
                    ) : (
                        <Routes>
                            <Route
                                path="/"
                                element={<ChatWindow
                                    isDiscreet={isDiscreet}
                                    onToggleDiscreet={() => setIsDiscreet(!isDiscreet)}
                                />}
                            />
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Routes>
                    )}
                </main>

                {/* Footer (Status Bar in Camouflage) */}
                <footer className="app-footer">
                    <p>Aegis AI &copy; 2026 &mdash; Built for privacy.</p>
                </footer>
            </div>
        </BrowserRouter>
    );
}

const RootApp = () => (
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

export default App;
