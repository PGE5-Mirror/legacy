import React, { useState } from 'react';
import { Modal, Button, Alert, Form } from 'react-bootstrap';
import { apiFetch, apiRequest } from '../api';
import { UserSettings } from '../types';

interface ProfileModalProps {
  show: boolean;
  onHide: () => void;
  onLogout: () => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export function ProfileModal({ show, onHide, onLogout, settings, setSettings }: ProfileModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const updateSettings = async (changes: Partial<UserSettings>) => {
    setError('');

    try {
      const updated = await apiRequest<UserSettings>('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify(changes),
      });

      setSettings(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setError('');

    try {
      const res = await apiFetch('/users/me/export');

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
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    ) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await apiRequest<void>('/users/me', { method: 'DELETE' });
      onLogout();
    } catch (err: any) {
      setError(err.message);
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

        <p className="text-muted mb-3">Accessibility Settings</p>

        <div className="col-10 mx-auto mb-4 border rounded p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className="fw-semibold">High-contrast mode</span>
            <Form.Check
              type="switch"
              id="high-contrast-switch"
              checked={settings.high_contrast}
              onChange={(event) => updateSettings({ high_contrast: event.target.checked })}
              className="mb-0"
            />
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <span className="fw-semibold">Font size</span>
            <Form.Control
              as="select"
              value={settings.font_size}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                updateSettings({
                  font_size: event.target.value as UserSettings['font_size'],
                })
              }
              style={{ width: 'auto' }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Form.Control>
          </div>
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
            onClick={() => {
              onHide();
              onLogout();
            }}
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
