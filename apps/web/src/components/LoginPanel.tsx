import React, { useEffect, useState } from 'react';

export interface AuthUser {
    id: string;
    email: string;
    role: 'user' | 'moderator';
    createdAt: string;
}

export const LoginPanel: React.FC<{
    user: AuthUser | null;
    onUserChange: (user: AuthUser | null) => void;
}> = ({ user, onUserChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Beim Laden prüfen, ob wir eingeloggt sind (/api/auth/me)
    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: AuthUser | null) => onUserChange(data))
            .catch(() => onUserChange(null));
    }, [onUserChange]);

    const handleLogin = async (
        e: React.SubmitEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        setError(null);

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            setError('Invalid email or password.');
            return;
        }

        const loggedInUser = (await res.json()) as AuthUser;
        onUserChange(loggedInUser);
        setEmail('');
        setPassword('');
    };

    const handleLogout = async (): Promise<void> => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        onUserChange(null);
    };

    // Wenn eingeloggt: User + Logout-Button anzeigen
    if (user !== null) {
        return (
            <section className="comments" style={{ marginBottom: '2rem' }}>
                <h2>Logged in</h2>
                <p style={{ textAlign: 'center' }}>
                    <strong>{user.email}</strong> ({user.role})
                </p>
                <button
                    type="button"
                    className="show-hide"
                    style={{ display: 'block', margin: '0 auto' }}
                    onClick={() => {
                        handleLogout().catch(() => {});
                    }}
                >
                    Logout
                </button>
            </section>
        );
    }

    // Wenn ausgeloggt: Login-Formular anzeigen
    return (
        <section className="comments" style={{ marginBottom: '2rem' }}>
            <h2>Login</h2>
            <form
                className="comment-form"
                onSubmit={(e) => {
                    handleLogin(e).catch(() => {});
                }}
            >
                <div className="flex-pair">
                    <label htmlFor="login-email">Email:</label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-pair">
                    <label htmlFor="login-password">Password:</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error !== null && <p className="form-error">{error}</p>}
                <input type="submit" value="Login" />
            </form>
        </section>
    );
};