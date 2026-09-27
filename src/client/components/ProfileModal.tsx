import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface ProfileModalProps {
    show: boolean;
    onHide: () => void;
    token: string;
    onLogout: () => void;
}

export function ProfileModal({ show, onHide, token, onLogout }: ProfileModalProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete this account?")) {
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const res = await fetch('/api/users/me', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) throw new Error('Could not delete user');
            onLogout();
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
            setDeleting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Mon Profil & Paramètres</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                {error && <Alert variant="danger">{error}</Alert>}

                <div className="mb-4">
                    <i className="fa fa-user-circle fa-5x text-secondary" />
                </div>

                <p className="text-muted mb-4">Gestion des données personnelles (RGPD)</p>

                <div className="d-grid gap-2 col-10 mx-auto">
                    <Button variant="outline-primary" className="mb-2" onClick={() => { onHide(); onLogout(); }}>
                        <i className="fa fa-sign-out-alt me-2" />
                        Déconnexion
                    </Button>

                    <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
                        <i className="fa fa-trash-alt me-2" />
                        {deleting ? 'Deleting...' : 'Deleting my account'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}