import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/AdminDashboard';
import DiscreetModeToggle from './components/DiscreetModeToggle';

/**
 * App.js — Root component for Silent Emergency.
 * Uses React Router for navigation between Chat (/) and Admin (/admin).
 */
function App() {
    const [isCamouflage, setIsCamouflage] = useState(false);

    // Stealth & Panic Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Panic Redirect (Esc key)
            if (e.key === 'Escape') {
                window.location.href = 'https://www.google.com/search?q=weather+today';
            }

            // Camouflage Toggle (Ctrl + Shift + S)
            if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
                setIsCamouflage(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <BrowserRouter>
            <div className={`app ${isCamouflage ? 'is-camouflage' : ''}`}>
                {/* Activity Bar (Leftmost) - Only in Camouflage */}
                {isCamouflage && (
                    <aside className="activity-bar">
                        <div className="activity-icon active">📄</div>
                        <div className="activity-icon">🔍</div>
                        <div className="activity-icon">🌿</div>
                        <div className="activity-icon">🐞</div>
                        <div className="activity-icon">🧩</div>
                    </aside>
                )}

                {/* Sidebar (Explorer) - Only in Camouflage */}
                {isCamouflage && (
                    <aside className="ide-sidebar">
                        <div className="sidebar-title">Explorer</div>
                        <div className="file-tree-item">📁 node_modules</div>
                        <div className="file-tree-item">📁 src</div>
                        <div className="file-tree-item active">📄 index.js</div>
                        <div className="file-tree-item">📄 package.json</div>
                        <div className="file-tree-item">📄 README.md</div>
                    </aside>
                )}

                {/* Header with navigation */}
                <header className="app-header">
                    <div className="header-inner">
                        <div className="logo">
                            <span className="logo-icon">💠</span>
                            <h1>Aegis</h1>
                        </div>

                        {/* Navigation links */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {!isCamouflage && (
                                <DiscreetModeToggle
                                    isDiscreet={isCamouflage}
                                    onToggle={() => setIsCamouflage(!isCamouflage)}
                                />
                            )}
                            <nav className="header-nav">
                                <NavLink
                                    to="/"
                                    end
                                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                                >
                                    {isCamouflage ? 'Main' : 'Chat'}
                                </NavLink>
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                                >
                                    {isCamouflage ? 'Logs' : 'Admin'}
                                </NavLink>
                            </nav>
                        </div>

                        <span className="header-tag">Aegis AI Core</span>
                    </div>
                </header>

                {/* Tab Bar - Only in Camouflage */}
                {isCamouflage && (
                    <div className="ide-tabs">
                        <div className="ide-tab active">
                            <span>JS</span> index.js <span>×</span>
                        </div>
                        <div className="ide-tab">
                            <span>MD</span> README.md
                        </div>
                    </div>
                )}

                {/* Route-based content */}
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<ChatWindow isCamouflage={isCamouflage} />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </main>

                {/* Footer (Status Bar in Camouflage) */}
                <footer className="app-footer">
                    {isCamouflage ? (
                        <>
                            <div className="footer-left">
                                <span>🌿 main*</span>
                                <span>0 Δ</span>
                                <span>0 θ</span>
                            </div>
                            <div className="footer-right">
                                <span>Ln 42, Col 18</span>
                                <span>Spaces: 2</span>
                                <span>UTF-8</span>
                                <span>Node.js v20.11.0</span>
                            </div>
                        </>
                    ) : (
                        <p>Aegis AI &copy; 2026 &mdash; Built for privacy.</p>
                    )}
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
