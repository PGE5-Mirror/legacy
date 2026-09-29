import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api';
import { AppNotification } from '../types';

const REFRESH_INTERVAL_MS = 10000;
const LAST_SEEN_KEY = 'notificationsLastSeen';

function countNew(notifications: AppNotification[], lastSeen: string): number {
  if (!lastSeen) return notifications.length;

  const lastSeenTime = new Date(lastSeen).getTime();
  return notifications.filter((n) => new Date(n.createdAt).getTime() > lastSeenTime).length;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem(LAST_SEEN_KEY) || '');
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    apiRequest<AppNotification[]>('/notifications')
      .then((data) => {
        setNotifications(data);
        setError('');
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;

    const closeOnClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnClickOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnClickOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      load();
      // Store a server timestamp so the badge never depends on the browser's clock
      const newest = notifications[0]?.createdAt;
      if (newest) {
        localStorage.setItem(LAST_SEEN_KEY, newest);
        setLastSeen(newest);
      }
    }
    setOpen(!open);
  };

  const newCount = countNew(notifications, lastSeen);

  return (
    <div className="taskflow-notifications" ref={containerRef}>
      <button
        type="button"
        className="taskflow-icon-button"
        aria-label={newCount > 0 ? `Notifications, ${newCount} new` : 'Notifications'}
        aria-expanded={open}
        aria-controls="notifications-panel"
        onClick={toggle}
      >
        <i className="fa fa-bell" />
        {newCount > 0 && (
          <span className="taskflow-notifications-badge" aria-hidden="true">
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-panel"
          className="taskflow-notifications-panel"
          role="region"
          aria-label="Notifications"
        >
          <h2>Notifications</h2>
          {error && <p className="taskflow-notifications-error">{error}</p>}
          {!error && notifications.length === 0 && (
            <p className="taskflow-notifications-empty">No notifications yet</p>
          )}
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <span>{notification.message}</span>
                <time dateTime={notification.createdAt}>
                  {new Date(notification.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
