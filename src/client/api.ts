const TOKEN_KEY = 'authToken';
const AUTH_MESSAGE_KEY = 'authMessage';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));

  if (typeof body.error === 'string') return body.error;
  if (typeof body.message === 'string') return body.message;

  return `Request failed (${response.status})`;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    sessionStorage.setItem(AUTH_MESSAGE_KEY, SESSION_EXPIRED_MESSAGE);
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export function consumeAuthMessage(): string {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY) || '';
  sessionStorage.removeItem(AUTH_MESSAGE_KEY);

  return message;
}
