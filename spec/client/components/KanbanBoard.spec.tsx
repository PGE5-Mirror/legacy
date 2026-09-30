import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { KanbanBoard } from '../../../src/client/components/KanbanBoard';
import { apiRequest } from '../../../src/client/api';
import { Item } from '../../../src/client/types';

jest.mock('../../../src/client/api');

const mockedRequest = apiRequest as jest.Mock;
const createdAt = '2026-09-30T10:00:00.000Z';

const existingTask: Item = {
  id: 'task-1',
  name: 'Write tests',
  completed: false,
  user_id: 'user-1',
  column_id: 'col-1',
  assigned_to: null,
  position: 0,
  createdAt,
};

const serverData: Record<string, unknown> = {
  '/organizations': [{ id: 'org-1', name: 'Legacy team', createdAt }],
  '/organizations/org-1/projects': [
    { id: 'proj-1', name: 'Project A', organization_id: 'org-1', createdAt },
  ],
  '/organizations/org-1/members': [
    { id: 'member-1', organization_id: 'org-1', user_id: 'user-1', role: 'admin', createdAt },
    { id: 'member-2', organization_id: 'org-1', user_id: 'user-2', role: 'member', createdAt },
  ],
  '/users': [
    { id: 'user-1', email: 'alice@test.com' },
    { id: 'user-2', email: 'bob@test.com' },
  ],
  '/columns?project_id=proj-1': [
    { id: 'col-1', name: 'To Do', position: 0, project_id: 'proj-1', createdAt },
    { id: 'col-2', name: 'Done', position: 1, project_id: 'proj-1', createdAt },
  ],
  '/columns/col-1/tasks': [existingTask],
  '/columns/col-2/tasks': [],
  '/notifications': [],
};

// Fake backend: GETs return serverData, POST/PUT echo the sent body back like the real API
function fakeServer(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(String(options.body)) : {};

  if (method === 'POST' && url === '/items') {
    return Promise.resolve({ ...existingTask, id: 'task-2', ...body });
  }
  if (method === 'PUT' && url === `/items/${existingTask.id}`) {
    return Promise.resolve({ ...existingTask, ...body });
  }
  if (method === 'GET' && url in serverData) {
    return Promise.resolve(serverData[url]);
  }
  return Promise.reject(new Error(`Unexpected request: ${method} ${url}`));
}

function bodySentTo(method: string, url: string) {
  const call = mockedRequest.mock.calls.find(
    ([calledUrl, options]) => calledUrl === url && options?.method === method,
  );
  return call ? JSON.parse(call[1].body) : undefined;
}

function column(name: string) {
  return screen.getByRole('heading', { name }).closest('section') as HTMLElement;
}

function taskCard(name: string) {
  return screen.getByText(name).closest('article') as HTMLElement;
}

async function renderBoard() {
  render(<KanbanBoard onOpenProfile={jest.fn()} />);
  await screen.findByText('Write tests');
}

describe('KanbanBoard', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
    mockedRequest.mockImplementation(fakeServer);
  });

  it('loads the columns and tasks of the first project', async () => {
    await renderBoard();

    expect(screen.getByRole('heading', { name: 'Project A' })).toBeInTheDocument();
    expect(within(column('To Do')).getByText('Write tests')).toBeInTheDocument();
    expect(column('Done')).toBeInTheDocument();
  });

  it('creates a task in the chosen column', async () => {
    await renderBoard();

    fireEvent.click(within(column('To Do')).getByRole('button', { name: 'Add Task' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Task name'), {
      target: { value: 'Review PR' },
    });
    fireEvent.change(within(dialog).getByLabelText('Assignee'), { target: { value: 'user-2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create task' }));

    // While the dialog is open, the board behind it is hidden from screen readers (and from getByRole)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(column('To Do')).getByText('Review PR')).toBeInTheDocument();
    expect(bodySentTo('POST', '/items')).toEqual({
      name: 'Review PR',
      column_id: 'col-1',
      assigned_to: 'user-2',
      position: 1,
    });
  });

  it('assigns a task to a member', async () => {
    await renderBoard();

    fireEvent.change(within(taskCard('Write tests')).getByLabelText('Assignee'), {
      target: { value: 'user-2' },
    });

    await waitFor(() =>
      expect(within(taskCard('Write tests')).getByLabelText('Assignee')).toHaveDisplayValue(
        'bob@test.com',
      ),
    );
    expect(bodySentTo('PUT', '/items/task-1')).toEqual({ assigned_to: 'user-2' });
  });

  it('moves a task to another column', async () => {
    await renderBoard();

    fireEvent.change(within(taskCard('Write tests')).getByLabelText('Move to'), {
      target: { value: 'col-2' },
    });

    expect(await within(column('Done')).findByText('Write tests')).toBeInTheDocument();
    expect(within(column('To Do')).queryByText('Write tests')).not.toBeInTheDocument();
    expect(bodySentTo('PUT', '/items/task-1')).toEqual({ column_id: 'col-2', position: 0 });
  });

  it('shows the server error message when a request fails', async () => {
    await renderBoard();
    mockedRequest.mockRejectedValueOnce(new Error('Forbidden'));

    fireEvent.change(within(taskCard('Write tests')).getByLabelText('Move to'), {
      target: { value: 'col-2' },
    });

    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
    expect(within(column('To Do')).getByText('Write tests')).toBeInTheDocument();
  });
});
