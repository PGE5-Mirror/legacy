import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { AuthForm } from './components/AuthForm';
import { KanbanBoard } from './components/KanbanBoard';
import { ProfileModal } from './components/ProfileModal';

export function App() {
    const [token, setToken] = useState<string>(
        () => localStorage.getItem('authToken') || '',
    );
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tosAccepted, setToSAccepted] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const handleAuth = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (isRegistering && !tosAccepted) {
            setError('You have to accept the Terms of Service!');
            return;
        }

        setLoading(true);
        const endpoint = isRegistering ? '/register' : '/login';

        fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        isRegistering
                            ? 'Registration failed'
                            : 'Invalid credentials',
                    );
                }

                return response.json();
            })
            .then((data) => {
                const receivedToken =
                    data.token ||
                    data.access_token ||
                    (typeof data === 'string' ? data : null);

                if (typeof receivedToken === 'string') {
                    localStorage.setItem('authToken', receivedToken);
                    setToken(receivedToken);
                    setLoading(false);
                    return;
                }

                if (isRegistering) {
                    return fetch('/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password }),
                        headers: { 'Content-Type': 'application/json' },
                    })
                        .then((loginResponse) => {
                            if (!loginResponse.ok) {
                                throw new Error(
                                    'Auto-login failed after registration',
                                );
                            }

                            return loginResponse.json();
                        })
                        .then((loginData) => {
                            const loginToken =
                                loginData.token ||
                                loginData.access_token ||
                                loginData;

                            if (typeof loginToken !== 'string') {
                                throw new TypeError('Invalid token format');
                            }

                            localStorage.setItem('authToken', loginToken);
                            setToken(loginToken);
                            setLoading(false);
                        });
                }

                throw new TypeError('Invalid token format');
            })
            .catch((authError: Error) => {
                setError(authError.message || 'Authentication error');
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
        <>
            {!token ? (
                <Container className="mt-5">
                    <Row>
                        <Col md={{ offset: 3, span: 6 }}>
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
                        </Col>
                    </Row>
                </Container>
            ) : (
                <KanbanBoard
                    token={token}
                    onOpenProfile={() => setShowProfile(true)}
                />
            )}

            <ProfileModal
                show={showProfile}
                onHide={() => setShowProfile(false)}
                token={token}
                onLogout={handleLogout}
            />
        </>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));