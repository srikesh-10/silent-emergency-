import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';

/**
 * App.js — Root component for Silent Emergency.
 * Uses React Router for navigation between Chat (/) and Admin (/admin).
 */
function App() {
    return (
        <BrowserRouter>
            <div className="app">
                {/* Header with navigation */}
                <header className="app-header">
                    <div className="header-inner">
                        <div className="logo">
                            <span className="logo-icon">🛡️</span>
                            <h1>Silent Emergency</h1>
                        </div>

                        {/* Navigation links */}
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

                        <span className="header-tag">AI Distress Detection</span>
                    </div>
                </header>

                {/* Route-based content */}
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<ChatWindow />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </main>

                {/* Footer */}
                <footer className="app-footer">
                    <p>Silent Emergency &copy; 2026 &mdash; Your safety matters.</p>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
