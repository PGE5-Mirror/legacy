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
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    const handleExportData = async () => {
        setExporting(true);
        setError('');

        try {
            const res = await fetch('/users/me/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Could not export user data');

            // Récupération du fichier JSON pour déclencher le téléchargement côté navigateur
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_data.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message || 'An error occurred during export.');
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
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
                <Modal.Title>My Profile & Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                {error && <Alert variant="danger">{error}</Alert>}

                <div className="mb-4">
                    <i className="fa fa-user-circle fa-5x text-secondary" />
                </div>

                <p className="text-muted mb-4">Personal Data Management (GDPR)</p>

                {/* Utilisation de flexbox Bootstrap pour aligner parfaitement tous les boutons */}
                <div className="d-flex flex-column gap-3 col-10 mx-auto">
                    <Button
                        variant="outline-primary"
                        onClick={handleExportData}
                        disabled={exporting}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <i className="fa fa-download me-2" />
                        {exporting ? 'Exporting...' : 'Export Personal Data'}
                    </Button>

                    <Button
                        variant="outline-secondary"
                        onClick={() => { onHide(); onLogout(); }}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <i className="fa fa-sign-out-alt me-2" />
                        Log out
                    </Button>

                    <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <i className="fa fa-trash-alt me-2" />
                        {deleting ? 'Deleting...' : 'Delete my account'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}