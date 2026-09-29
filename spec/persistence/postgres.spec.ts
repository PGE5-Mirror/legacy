import { Pool } from 'pg';
import * as postgres from '../../src/server/persistence/postgres';

jest.mock('pg', () => {
  const mQuery = jest.fn();
  const mEnd = jest.fn();
  const mPool = jest.fn(() => ({
    query: mQuery,
    end: mEnd,
  }));
  return { Pool: mPool };
});

describe('PostgreSQL Persistence Layer', () => {
  let poolInstance: { query: jest.Mock; end: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    poolInstance = new (Pool as unknown as jest.Mock)();
  });

  describe('init and teardown', () => {
    it('should query SELECT 1 on init', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

      await postgres.init();

      expect(poolInstance.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should end the pool on teardown', async () => {
      poolInstance.end.mockResolvedValueOnce(undefined);

      await postgres.teardown();

      expect(poolInstance.end).toHaveBeenCalled();
    });
  });

  describe('Items operations', () => {
    it('should get all items', async () => {
      const mockItems = [{ id: 'task-1', name: 'Task 1' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockItems });

      const result = await postgres.getItems();

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks order by "createdAt" DESC'
      );
      expect(result).toEqual(mockItems);
    });

    it('should get a single item by id', async () => {
      const mockItem = { id: 'task-1', name: 'Task 1' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockItem] });

      const result = await postgres.getItem('task-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = $1',
        ['task-1']
      );
      expect(result).toEqual(mockItem);
    });

    it('should get items by user id', async () => {
      const mockItems = [{ id: 'task-1', name: 'Task 1', userId: 'user-1' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockItems });

      const result = await postgres.getItemsByUserId('user-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY "createdAt" DESC',
        ['user-1']
      );
      expect(result).toEqual(mockItems);
    });

    it('should store a new item', async () => {
      const newItem = { id: 'task-1', name: 'New Task', userId: 'user-1' };
      poolInstance.query.mockResolvedValueOnce({ rows: [newItem] });

      const result = await postgres.storeItem(newItem);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO tasks (id, name, user_id) VALUES ($1, $2, $3) RETURNING *',
        ['task-1', 'New Task', 'user-1']
      );
      expect(result).toEqual(newItem);
    });

    it('should update an item', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.updateItem('task-1', { name: 'Updated Task', completed: true });

      expect(poolInstance.query).toHaveBeenCalledWith(
        'UPDATE tasks SET name = $1, completed = $2 WHERE id = $3',
        ['Updated Task', true, 'task-1']
      );
    });

    it('should remove an item', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.removeItem('task-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'DELETE FROM tasks WHERE id = $1',
        ['task-1']
      );
    });
  });

  describe('Projects operations', () => {
    it('should get projects by organizationId', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Project 1', organization_id: 'org-1' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockProjects });

      const result = await postgres.getProjects('org-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE organization_id = $1 ORDER BY "createdAt" DESC',
        ['org-1']
      );
      expect(result).toEqual(mockProjects);
    });

    it('should get all projects when organizationId is not provided', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Project 1' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockProjects });

      const result = await postgres.getProjects();

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM projects ORDER BY "createdAt" DESC'
      );
      expect(result).toEqual(mockProjects);
    });

    it('should get a single project by id', async () => {
      const mockProject = { id: 'proj-1', name: 'Project 1' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockProject] });

      const result = await postgres.getProject('proj-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE id = $1',
        ['proj-1']
      );
      expect(result).toEqual(mockProject);
    });

    it('should store a new project', async () => {
      const newProjectInput = { name: 'New Project', organization_id: 'org-1' };
      const storedProject = { id: 'proj-1', ...newProjectInput };
      poolInstance.query.mockResolvedValueOnce({ rows: [storedProject] });

      const result = await postgres.storeProject(newProjectInput);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO projects (name, organization_id) VALUES ($1, $2) RETURNING *',
        ['New Project', 'org-1']
      );
      expect(result).toEqual(storedProject);
    });

    it('should update a project', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.updateProject('proj-1', { name: 'Updated Name' });

      expect(poolInstance.query).toHaveBeenCalledWith(
        'UPDATE projects SET name = $1 WHERE id = $2',
        ['Updated Name', 'proj-1']
      );
    });

    it('should remove a project', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.removeProject('proj-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'DELETE FROM projects WHERE id = $1',
        ['proj-1']
      );
    });
  });

  describe('Columns operations', () => {
    it('should get columns by projectId', async () => {
      const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'proj-1', position: 1 }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockColumns });

      const result = await postgres.getColumns('proj-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM columns WHERE project_id = $1 ORDER BY position ASC',
        ['proj-1']
      );
      expect(result).toEqual(mockColumns);
    });

    it('should get all columns when projectId is not provided', async () => {
      const mockColumns = [{ id: 'col-1', name: 'To Do', position: 1 }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockColumns });

      const result = await postgres.getColumns();

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM columns ORDER BY position ASC'
      );
      expect(result).toEqual(mockColumns);
    });

    it('should get a single column by id', async () => {
      const mockColumn = { id: 'col-1', name: 'To Do' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockColumn] });

      const result = await postgres.getColumn('col-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM columns WHERE id = $1',
        ['col-1']
      );
      expect(result).toEqual(mockColumn);
    });

    it('should store a new column', async () => {
      const newColumn = { name: 'Done', project_id: 'proj-1' };
      const storedColumn = { id: 'col-2', ...newColumn };
      poolInstance.query.mockResolvedValueOnce({ rows: [storedColumn] });

      const result = await postgres.storeColumn(newColumn);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO columns (name, project_id) VALUES ($1, $2) RETURNING *',
        ['Done', 'proj-1']
      );
      expect(result).toEqual(storedColumn);
    });

    it('should update a column', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.updateColumn('col-1', { name: 'In Progress', position: 2 });

      expect(poolInstance.query).toHaveBeenCalledWith(
        'UPDATE columns SET name = $1, position = $2 WHERE id = $3',
        ['In Progress', 2, 'col-1']
      );
    });

    it('should remove a column', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.removeColumn('col-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'DELETE FROM columns WHERE id = $1',
        ['col-1']
      );
    });
  });

  describe('Organizations operations', () => {
    it('should get all organizations', async () => {
      const mockOrgs = [{ id: 'org-1', name: 'Org 1' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockOrgs });

      const result = await postgres.getOrganizations();

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM organizations order by "createdAt" DESC'
      );
      expect(result).toEqual(mockOrgs);
    });

    it('should get a single organization by id', async () => {
      const mockOrg = { id: 'org-1', name: 'Org 1' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockOrg] });

      const result = await postgres.getOrganization('org-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM organizations WHERE id = $1',
        ['org-1']
      );
      expect(result).toEqual(mockOrg);
    });

    it('should store an organization', async () => {
      const newOrg = { name: 'Org 1' };
      const storedOrg = { id: 'org-1', name: 'Org 1' };
      poolInstance.query.mockResolvedValueOnce({ rows: [storedOrg] });

      const result = await postgres.storeOrganization(newOrg);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
        ['Org 1']
      );
      expect(result).toEqual(storedOrg);
    });

    it('should update an organization', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.updateOrganization('org-1', { name: 'New Org Name' });

      expect(poolInstance.query).toHaveBeenCalledWith(
        'UPDATE organizations SET name = $1 WHERE id = $2',
        ['New Org Name', 'org-1']
      );
    });

    it('should remove an organization', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.removeOrganization('org-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'DELETE FROM organizations WHERE id = $1',
        ['org-1']
      );
    });
  });

  describe('Organization Members operations', () => {
    it('should get organization members by organizationId', async () => {
      const mockMembers = [{ id: 'mem-1', organization_id: 'org-1', user_id: 'user-1', role: 'admin' }];
      poolInstance.query.mockResolvedValueOnce({ rows: mockMembers });

      const result = await postgres.getOrganizationMembers('org-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM organization_members WHERE organization_id = $1 order by "createdAt" ASC',
        ['org-1']
      );
      expect(result).toEqual(mockMembers);
    });

    it('should get a single organization member by id', async () => {
      const mockMember = { id: 'mem-1', role: 'member' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockMember] });

      const result = await postgres.getOrganizationMember('mem-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM organization_members WHERE id = $1',
        ['mem-1']
      );
      expect(result).toEqual(mockMember);
    });

    it('should store an organization member with default role', async () => {
      const newMember = { organization_id: 'org-1', user_id: 'user-1' };
      const storedMember = { id: 'mem-1', ...newMember, role: 'member' };
      poolInstance.query.mockResolvedValueOnce({ rows: [storedMember] });

      const result = await postgres.storeOrganizationMember(newMember);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
        ['org-1', 'user-1', 'member']
      );
      expect(result).toEqual(storedMember);
    });

    it('should update an organization member', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.updateOrganizationMember('mem-1', { role: 'admin' });

      expect(poolInstance.query).toHaveBeenCalledWith(
        'UPDATE organization_members SET role = $1 WHERE id = $2',
        ['admin', 'mem-1']
      );
    });

    it('should remove an organization member', async () => {
      poolInstance.query.mockResolvedValueOnce({ rows: [] });

      await postgres.removeOrganizationMember('mem-1');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'DELETE FROM organization_members WHERE id = $1',
        ['mem-1']
      );
    });
  });

  describe('Users operations', () => {
    it('should store a user', async () => {
      const newUser = { id: 'user-1', email: 'test@example.com', password: 'hashedpassword' };
      poolInstance.query.mockResolvedValueOnce({ rows: [newUser] });

      const result = await postgres.storeUser(newUser);

      expect(poolInstance.query).toHaveBeenCalledWith(
        'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *',
        ['user-1', 'test@example.com', 'hashedpassword']
      );
      expect(result).toEqual(newUser);
    });

    it('should get a user by email', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      poolInstance.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await postgres.getUser('test@example.com');

      expect(poolInstance.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });
  });
});