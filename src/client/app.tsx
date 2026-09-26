import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { AuthForm } from './components/AuthForm';
import { ProfileModal } from './components/ProfileModal';
import { TodoListCard } from './components/TodoListCard';

export function App() {
    const [token, setToken] = useState<string>(() => localStorage.getItem('authToken') || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tosAccepted, setToSAccepted] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (isRegistering && !tosAccepted) {
            setError('You had to accept the Terms of Service!');
            return;
        }

        setLoading(true);
        const endpoint = isRegistering ? '/register' : '/login';

        fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((r) => {
                if (!r.ok) throw new Error(isRegistering ? 'Registration failed' : 'Invalid credentials');
                return r.json();
            })
            .then((data) => {
                const receivedToken = data.token || data.access_token || (typeof data === 'string' ? data : null);

                if (typeof receivedToken === 'string') {
                    localStorage.setItem('authToken', receivedToken);
                    setToken(receivedToken);
                    setLoading(false);
                } else if (isRegistering) {
                    return fetch('/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password }),
                        headers: { 'Content-Type': 'application/json' },
                    })
                        .then((loginRes) => {
                            if (!loginRes.ok) throw new Error('Auto-login failed after registration');
                            return loginRes.json();
                        })
                        .then((loginData) => {
                            const loginToken = loginData.token || loginData.access_token || loginData;
                            if (typeof loginToken === 'string') {
                                localStorage.setItem('authToken', loginToken);
                                setToken(loginToken);
                            } else {
                                throw new TypeError('Invalid token format');
                            }
                            setLoading(false);
                        });
                } else {
                    throw new TypeError('Invalid token format');
                }
            })
            .catch((err: Error) => {
                setError(err.message || 'Authentication error');
                setLoading(false);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setToken('');
        setEmail('');
        setPassword('');
        setToSAccepted(false);
        setError('');
        setSuccessMessage('');
        setShowProfile(false);
    };

    return (
        <Container className="mt-4">
            {token && (
                <div className="d-flex justify-content-end mb-3">
                    <Button
                        variant="light"
                        className="rounded-circle p-0 border shadow-sm"
                        style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowProfile(true)}
                        aria-label="Profil utilisateur"
                    >
                        <i className="fa fa-user fa-lg text-secondary" />
                    </Button>
                </div>
            )}

            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    {!token ? (
                        <AuthForm
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            tosAccepted={tosAccepted}
                            setToSAccepted={setToSAccepted}
                            onSubmit={handleAuth}
                            isRegistering={isRegistering}
                            toggleMode={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setSuccessMessage('');
                                setToSAccepted(false);
                            }}
                            error={error}
                            successMessage={successMessage}
                            loading={loading}
                        />
                    ) : (
                        <TodoListCard token={token} />
                    )}
                </Col>
            </Row>

            <ProfileModal
                show={showProfile}
                onHide={() => setShowProfile(false)}
                token={token}
                onLogout={handleLogout}
            />
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));