import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

interface AuthFormProps {
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    tosAccepted: boolean;
    setToSAccepted: (v: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    isRegistering: boolean;
    toggleMode: () => void;
    error: string;
    successMessage: string;
    loading: boolean;
}

export function AuthForm({
                             email,
                             setEmail,
                             password,
                             setPassword,
                             tosAccepted,
                             setToSAccepted,
                             onSubmit,
                             isRegistering,
                             toggleMode,
                             error,
                             successMessage,
                             loading,
                         }: AuthFormProps) {
    return (
        <div className="card mt-5 shadow-sm">
            <div className="card-body p-4">
                <h3 className="card-title text-center mb-4">
                    {isRegistering ? 'Create Account' : 'Login'}
                </h3>
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {isRegistering && (
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="tos-checkbox"
                                label="J'accepte les conditions générales d'utilisation (tos)"
                                checked={tosAccepted}
                                onChange={(e) => setToSAccepted(e.target.checked)}
                            />
                        </Form.Group>
                    )}

                    <Button variant="success" type="submit" className="w-100 mt-2" disabled={loading}>
                        {loading
                            ? isRegistering ? 'Creating account...' : 'Connecting...'
                            : isRegistering ? 'Sign Up' : 'Login'}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <small>
                        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            type="button"
                            className="btn btn-link text-success fw-bold p-0 align-baseline text-decoration-underline"
                            onClick={toggleMode}
                        >
                            {isRegistering ? 'Log in' : 'Sign up'}
                        </button>
                    </small>
                </div>
            </div>
        </div>
    );
}