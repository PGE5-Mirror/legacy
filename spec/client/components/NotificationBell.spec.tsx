import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { NotificationBell } from '../../../src/client/components/NotificationBell';
import { apiRequest } from '../../../src/client/api';
import { AppNotification } from '../../../src/client/types';

jest.mock('../../../src/client/api');

const mockedRequest = apiRequest as jest.Mock;

// The server sends the newest notification first
const newest: AppNotification = {
  id: 'notif-2',
  user_id: 'user-1',
  message: 'New task: Deploy the app',
  read: false,
  createdAt: '2026-09-30T11:00:00.000Z',
};
const older: AppNotification = {
  id: 'notif-1',
  user_id: 'user-1',
  message: 'New task: Write tests',
  read: false,
  createdAt: '2026-09-30T10:00:00.000Z',
};

// The badge number is aria-hidden, so the count is read from the button's label
function bellButton() {
  return screen.getByRole('button', { name: /^Notifications/ });
}

function queryPanel() {
  return screen.queryByRole('region', { name: 'Notifications' });
}

async function openPanel() {
  fireEvent.click(bellButton());
  return screen.findByRole('region', { name: 'Notifications' });
}

beforeEach(() => {
  mockedRequest.mockReset();
  mockedRequest.mockResolvedValue([newest, older]);
  localStorage.clear();
});

describe('NotificationBell', () => {
  it('shows the number of new notifications in the badge', async () => {
    render(<NotificationBell />);

    expect(await screen.findByRole('button', { name: 'Notifications, 2 new' })).toHaveTextContent(
      '2',
    );
    expect(mockedRequest).toHaveBeenCalledWith('/notifications');
  });

  it('only counts notifications newer than the last one seen', async () => {
    localStorage.setItem('notificationsLastSeen', String(Date.parse(older.createdAt)));

    render(<NotificationBell />);

    expect(await screen.findByRole('button', { name: 'Notifications, 1 new' })).toBeInTheDocument();
  });

  it('opening the dropdown lists the notifications newest first and clears the badge', async () => {
    render(<NotificationBell />);
    await screen.findByRole('button', { name: 'Notifications, 2 new' });

    const panel = await openPanel();

    const items = within(panel).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(newest.message);
    expect(items[1]).toHaveTextContent(older.message);
    expect(bellButton()).toHaveAccessibleName('Notifications');
    expect(bellButton()).toHaveAttribute('aria-expanded', 'true');
    // Remembered so the badge stays cleared after a page reload
    expect(localStorage.getItem('notificationsLastSeen')).toBe(String(Date.parse(newest.createdAt)));
  });

  it('shows "No notifications yet" when there are none', async () => {
    mockedRequest.mockResolvedValue([]);
    render(<NotificationBell />);

    const panel = await openPanel();

    expect(within(panel).getByText('No notifications yet')).toBeInTheDocument();
    expect(bellButton()).toHaveAccessibleName('Notifications');
  });

  it('shows the server error when loading fails', async () => {
    mockedRequest.mockRejectedValue(new Error('Could not load notifications'));
    render(<NotificationBell />);

    const panel = await openPanel();

    expect(await within(panel).findByText('Could not load notifications')).toBeInTheDocument();
    expect(within(panel).queryByText('No notifications yet')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<NotificationBell />);
    await openPanel();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(queryPanel()).not.toBeInTheDocument();
    expect(bellButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a click outside, but not on a click inside', async () => {
    render(<NotificationBell />);
    const panel = await openPanel();

    fireEvent.mouseDown(within(panel).getByText(newest.message));
    expect(queryPanel()).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(queryPanel()).not.toBeInTheDocument();
  });
});
