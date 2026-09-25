function ProfileModal({ show, onHide, token, onLogout }) {
    const { Modal, Button, Alert } = ReactBootstrap;
    const [deleting, setDeleting] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleDeleteAccount = () => {
        if (!window.confirm("Are you sure you want to delete this account?")) {
            return;
        }

        setDeleting(true);
        setError('');

        fetch('user/me', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then((r) => {
                if (!r.ok) throw new Error('Failed to delete this account');
                onLogout();
            })
            .catch((err) => {
                setError(err.message);
                setDeleting(false);
            });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>My profile & parameters</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                {error && <Alert variant="warning">{error}</Alert>}

                {/* profile picture */}
                <div className="mb-4">
                    <i className="fa fa-user-circle fa-5x text-secondary" />
                </div>

                <p className="text-muted mb-4">GDPR management</p>

                <div className="d-grid gap-2 col-10 mx-auto">
                    {/* connexion action */}
                    <Button variant="outline-primary" className="mb-2" onClick={() => { onHide(); onLogout(); }}>
                        <i className="fa fa-sign-out-alt me-2" />
                        Deconnexion
                    </Button>

                    {/* Delete account action */}
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
                        <i className="fa fa-trash-alt me-2" />
                        {deleting ? 'deleting...' : 'Delete Account'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}