import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { OrganizationManager } from '../../../src/client/components/OrganizationManager';
import { Organization } from '../../../src/client/types';

const createdAt = '2026-09-30T10:00:00.000Z';
const legacyTeam: Organization = { id: 'org-1', name: 'Legacy team', createdAt };

const serverData: Record<string, unknown> = {
  '/users': [
    { id: 'user-1', email: 'alice@test.com' },
    { id: 'user-2', email: 'bob@test.com' },
    { id: 'user-3', email: 'carol@test.com' },
  ],
  '/organizations/org-1/members': [
    { id: 'member-1', organization_id: 'org-1', user_id: 'user-1', role: 'admin', createdAt },
    { id: 'member-2', organization_id: 'org-1', user_id: 'user-2', role: 'member', createdAt },
  ],
  '/organizations/org-2/members': [],
};

// Fake backend: GETs return serverData, POSTs echo the sent body back like the real API
function fakeServer(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (method === 'POST' && url === '/organizations') {
    return Promise.resolve({ id: 'org-2', createdAt, ...body });
  }
  if (method === 'POST' && url === '/organizations/org-1/projects') {
    return Promise.resolve({ id: 'proj-1', organization_id: 'org-1', createdAt, ...body });
  }
  if (method === 'POST' && url === '/organizations/org-1/members') {
    return Promise.resolve({
      id: 'member-3',
      organization_id: 'org-1',
      role: 'member',
      createdAt,
      ...body,
    });
  }
  if (method === 'GET' && url in serverData) {
    return Promise.resolve(serverData[url]);
  }
  return Promise.reject(new Error(`Unexpected request: ${method} ${url}`));
}

function bodySentTo(request: jest.Mock, method: string, url: string) {
  const call = request.mock.calls.find(
    ([calledUrl, options]) => calledUrl === url && options?.method === method,
  );
  return call ? JSON.parse(call[1].body) : undefined;
}

function formOf(label: string) {
  return screen.getByLabelText(label).closest('form') as HTMLElement;
}

// Keeps the organization list in state like KanbanBoard does, so created organizations show up
function renderManager() {
  const request = jest.fn(fakeServer) as jest.Mock;
  const onProjectCreated = jest.fn();

  function Parent() {
    const [organizations, setOrganizations] = useState<Organization[]>([legacyTeam]);

    return (
      <OrganizationManager
        organizations={organizations}
        request={request}
        onOrganizationCreated={(organization) =>
          setOrganizations((current) => [...current, organization])
        }
        onOrganizationDeleted={jest.fn()}
        onProjectCreated={onProjectCreated}
      />
    );
  }

  render(<Parent />);
  return { request, onProjectCreated };
}

async function openManager() {
  fireEvent.click(screen.getByRole('button', { name: 'Manage organizations' }));
  await screen.findByText('alice@test.com');
}

describe('OrganizationManager', () => {
  it('loads the users and members when opened', async () => {
    const { request } = renderManager();
    expect(request).not.toHaveBeenCalled();

    await openManager();

    expect(request).toHaveBeenCalledWith('/users');
    expect(request).toHaveBeenCalledWith('/organizations/org-1/members');
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    // Only users who are not members yet can be added
    const userOptions = within(screen.getByLabelText('Add a user')).getAllByRole('option');
    expect(userOptions.map((option) => option.textContent)).toEqual([
      'Choose a user',
      'carol@test.com',
    ]);
  });

  it('creates an organization and selects it', async () => {
    const { request } = renderManager();
    await openManager();

    fireEvent.change(screen.getByLabelText('Create organization'), {
      target: { value: '  New team  ' },
    });
    fireEvent.click(within(formOf('Create organization')).getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('No members found.')).toBeInTheDocument();
    expect(bodySentTo(request, 'POST', '/organizations')).toEqual({ name: 'New team' });
    expect(screen.getByLabelText('Organization')).toHaveDisplayValue('New team');
    expect(screen.getByLabelText('Create organization')).toHaveValue('');
  });

  it('creates a project in the selected organization', async () => {
    const { request, onProjectCreated } = renderManager();
    await openManager();

    fireEvent.change(screen.getByLabelText('Create project'), { target: { value: 'Website' } });
    fireEvent.click(within(formOf('Create project')).getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(screen.getByLabelText('Create project')).toHaveValue(''));
    expect(bodySentTo(request, 'POST', '/organizations/org-1/projects')).toEqual({
      name: 'Website',
    });
    expect(onProjectCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'proj-1', name: 'Website', organization_id: 'org-1' }),
    );
  });

  it('adds a member and shows them in the list', async () => {
    const { request } = renderManager();
    await openManager();

    fireEvent.change(screen.getByLabelText('Add a user'), { target: { value: 'user-3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(await within(screen.getByRole('list')).findByText('carol@test.com')).toBeInTheDocument();
    expect(bodySentTo(request, 'POST', '/organizations/org-1/members')).toEqual({
      user_id: 'user-3',
    });
    expect(screen.getByLabelText('Add a user')).toHaveDisplayValue('All users are already members');
  });

  it('shows the server error when a request fails', async () => {
    const { request } = renderManager();
    await openManager();
    request.mockImplementation((url: string, options: RequestInit = {}) =>
      options.method === 'POST'
        ? Promise.reject(new Error('Organization name already taken'))
        : fakeServer(url, options),
    );

    fireEvent.change(screen.getByLabelText('Create organization'), {
      target: { value: 'Legacy team' },
    });
    fireEvent.click(within(formOf('Create organization')).getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Organization name already taken')).toHaveClass('alert-danger');
    expect(within(screen.getByLabelText('Organization')).getAllByRole('option')).toHaveLength(1);
  });
});
