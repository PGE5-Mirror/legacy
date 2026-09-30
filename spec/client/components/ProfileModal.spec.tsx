import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProfileModal } from '../../../src/client/components/ProfileModal';
import { apiFetch, apiRequest } from '../../../src/client/api';
import { UserSettings } from '../../../src/client/types';

jest.mock('../../../src/client/api');

const mockedRequest = apiRequest as jest.Mock;
const mockedFetch = apiFetch as jest.Mock;

const settings: UserSettings = { user_id: 'user-1', high_contrast: false, font_size: 'medium' };

function renderModal() {
  const props = {
    show: true,
    onHide: jest.fn(),
    onLogout: jest.fn(),
    settings,
    setSettings: jest.fn(),
  };
  render(<ProfileModal {...props} />);
  return props;
}

beforeEach(() => {
  mockedRequest.mockReset();
  mockedFetch.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ProfileModal', () => {
  describe('accessibility settings', () => {
    it('saves high contrast when the switch is toggled', async () => {
      mockedRequest.mockResolvedValue({ ...settings, high_contrast: true });
      const { setSettings } = renderModal();

      // The switch has no accessible name yet, so it's found by its role (only checkbox in the modal)
      fireEvent.click(screen.getByRole('checkbox'));

      await waitFor(() =>
        expect(setSettings).toHaveBeenCalledWith({ ...settings, high_contrast: true }),
      );
      expect(mockedRequest).toHaveBeenCalledWith('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify({ high_contrast: true }),
      });
    });

    it('saves the font size when it is changed', async () => {
      mockedRequest.mockResolvedValue({ ...settings, font_size: 'large' });
      const { setSettings } = renderModal();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'large' } });

      await waitFor(() =>
        expect(setSettings).toHaveBeenCalledWith({ ...settings, font_size: 'large' }),
      );
      expect(mockedRequest).toHaveBeenCalledWith('/users/me/settings', {
        method: 'PUT',
        body: JSON.stringify({ font_size: 'large' }),
      });
    });

    it('shows the server error when saving fails', async () => {
      mockedRequest.mockRejectedValue(new Error('Could not save settings'));
      const { setSettings } = renderModal();

      fireEvent.click(screen.getByRole('checkbox'));

      expect(await screen.findByText('Could not save settings')).toBeInTheDocument();
      expect(setSettings).not.toHaveBeenCalled();
    });
  });

  describe('personal data (GDPR)', () => {
    it('downloads the exported data as user_data.json', async () => {
      mockedFetch.mockResolvedValue({ blob: () => Promise.resolve(new Blob(['{}'])) });
      // jsdom has no file downloads, so the browser pieces the export uses are faked
      window.URL.createObjectURL = jest.fn(() => 'blob:export');
      window.URL.revokeObjectURL = jest.fn();
      let downloadedFile = '';
      jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        downloadedFile = this.download;
      });
      renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Export Personal Data' }));

      await waitFor(() => expect(downloadedFile).toBe('user_data.json'));
      expect(mockedFetch).toHaveBeenCalledWith('/users/me/export');
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:export');
    });

    it('shows the server error when the export fails', async () => {
      mockedFetch.mockRejectedValue(new Error('Could not export user data'));
      renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Export Personal Data' }));

      expect(await screen.findByText('Could not export user data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Export Personal Data' })).toBeEnabled();
    });

    it('deletes the account after confirmation and logs out', async () => {
      const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockedRequest.mockResolvedValue(undefined);
      const { onLogout } = renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));

      await waitFor(() => expect(onLogout).toHaveBeenCalled());
      expect(confirm).toHaveBeenCalled();
      expect(mockedRequest).toHaveBeenCalledWith('/users/me', { method: 'DELETE' });
    });

    it('keeps the account when the confirmation is cancelled', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      const { onLogout } = renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));

      expect(mockedRequest).not.toHaveBeenCalled();
      expect(onLogout).not.toHaveBeenCalled();
    });

    it('shows the server error and stays logged in when deletion fails', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockedRequest.mockRejectedValue(new Error('User not authenticated'));
      const { onLogout } = renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));

      expect(await screen.findByText('User not authenticated')).toBeInTheDocument();
      expect(onLogout).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Delete my account' })).toBeEnabled();
    });
  });

  it('logs out when clicking "Log out"', () => {
    const { onHide, onLogout } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onHide).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });
});
