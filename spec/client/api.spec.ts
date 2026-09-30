import { apiFetch, apiRequest, consumeAuthMessage } from '../../src/client/api';

const SESSION_EXPIRED = 'Your session has expired. Please log in again.';
const fetchMock = jest.fn();

// jsdom has no fetch or Response, so tests use this minimal stand-in
function fakeResponse(status: number, body?: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => (body === undefined ? Promise.reject(new Error('No body')) : Promise.resolve(body)),
  } as unknown as Response;
}

function headersSent() {
  return fetchMock.mock.calls[0][1].headers;
}

beforeEach(() => {
  fetchMock.mockReset();
  window.fetch = fetchMock as unknown as typeof window.fetch;
  localStorage.clear();
  sessionStorage.clear();
});

describe('apiFetch', () => {
  it('adds the Authorization header when a token is stored', async () => {
    localStorage.setItem('authToken', 'my-token');
    fetchMock.mockResolvedValue(fakeResponse(200, {}));

    await apiFetch('/items');

    expect(headersSent()).toEqual(expect.objectContaining({ Authorization: 'Bearer my-token' }));
  });

  it('sends no Authorization header without a token', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, {}));

    await apiFetch('/items');

    expect(headersSent()).not.toHaveProperty('Authorization');
  });

  it('adds the JSON Content-Type only when there is a body', async () => {
    fetchMock.mockResolvedValue(fakeResponse(201, {}));

    await apiFetch('/items', { method: 'POST', body: JSON.stringify({ name: 'Task' }) });

    expect(headersSent()).toEqual(expect.objectContaining({ 'Content-Type': 'application/json' }));
  });

  it('on 401 stores the session message, clears the token and reloads the page', async () => {
    localStorage.setItem('authToken', 'expired-token');
    fetchMock.mockResolvedValue(fakeResponse(401, { error: 'Invalid or expired token' }));
    // jsdom can't reload pages: it reports "Not implemented: navigation" through console.error instead
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(apiFetch('/items')).rejects.toThrow(SESSION_EXPIRED);

    expect(sessionStorage.getItem('authMessage')).toBe(SESSION_EXPIRED);
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('navigation') }),
    );

    consoleError.mockRestore();
  });

  it("throws the server's error field on other failures", async () => {
    fetchMock.mockResolvedValue(fakeResponse(403, { error: 'Forbidden' }));

    await expect(apiFetch('/items/1')).rejects.toThrow('Forbidden');
  });

  it("throws the server's message field when there is no error field", async () => {
    fetchMock.mockResolvedValue(fakeResponse(404, { message: 'Task not found' }));

    await expect(apiFetch('/items/1')).rejects.toThrow('Task not found');
  });

  it('throws a fallback with the status code when the body has no message', async () => {
    fetchMock.mockResolvedValue(fakeResponse(500));

    await expect(apiFetch('/items')).rejects.toThrow('Request failed (500)');
  });
});

describe('apiRequest', () => {
  it('returns the parsed JSON body', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, [{ id: '1', name: 'Task' }]));

    await expect(apiRequest('/items')).resolves.toEqual([{ id: '1', name: 'Task' }]);
  });

  it('returns undefined on 204 No Content', async () => {
    fetchMock.mockResolvedValue(fakeResponse(204));

    await expect(apiRequest('/items/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});

describe('consumeAuthMessage', () => {
  it('returns the stored message once, then clears it', () => {
    sessionStorage.setItem('authMessage', SESSION_EXPIRED);

    expect(consumeAuthMessage()).toBe(SESSION_EXPIRED);
    expect(consumeAuthMessage()).toBe('');
  });
});
