import React, { useState } from 'react';

function Login({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Incorrect password');
                }
                throw new Error('Server error');
            }

            const data = await response.json();
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-dashboard admin-login">
            <div className="admin-header">
                <h2 className="admin-title">🛡️ Admin Risk Monitor</h2>
                <p className="admin-subtitle">Authentication Required</p>
            </div>
            <div className="admin-login-card">
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <label htmlFor="password">Administrator Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (admin123)"
                        disabled={isLoading}
                        autoFocus
                    />
                    {error && <div className="admin-login-error">{error}</div>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
