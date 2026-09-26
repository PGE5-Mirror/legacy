import { Pool, QueryResult } from 'pg';
import { Project, NewProject, ProjectUpdate } from '../models/Project';
import { Column, NewColumn, ColumnUpdate } from '../models/Column';
import { Organization, NewOrganization, OrganizationUpdate } from '../models/Organization';
import {
  OrganizationMember,
  NewOrganizationMember,
  OrganizationMemberUpdate,
} from '../models/OrganizationMember';

interface Task {
  id?: string;
  name: string;
  completed?: boolean;
  userId?: string;
  createdAt?: Date;
}

interface User {
  id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function init(): Promise<void> {
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL');
}

async function teardown(): Promise<void> {
  await pool.end();
}

async function getItems(): Promise<Task[]> {
  const { rows }: QueryResult<Task> = await pool.query(
    'SELECT * FROM tasks order by "createdAt" DESC',
  );
  return rows;
}

async function getItem(id: string): Promise<Task | undefined> {
  const { rows }: QueryResult<Task> = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0];
}

async function storeItem(item: Task): Promise<Task> {
  const { rows }: QueryResult<Task> = await pool.query(
    'INSERT INTO tasks (id, name, user_id) VALUES ($1, $2, $3) RETURNING *',
    [item.id, item.name, item.userId],
  );
  return rows[0];
}

async function updateItem(id: string, item: Task): Promise<void> {
  await pool.query('UPDATE tasks SET name = $1, completed = $2 WHERE id = $3', [
    item.name,
    item.completed,
    id,
  ]);
}

async function removeItem(id: string): Promise<void> {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}

export async function getProjects(organizationId?: string): Promise<Project[]> {
  if (organizationId) {
    const { rows } = await pool.query<Project>(
      'SELECT * FROM projects WHERE organization_id = $1 ORDER BY "createdAt" DESC',
      [organizationId],
    );
    return rows;
  }
  const { rows } = await pool.query<Project>('SELECT * FROM projects ORDER BY "createdAt" DESC');
  return rows;
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { rows } = await pool.query<Project>('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0];
}

export async function storeProject(project: NewProject): Promise<Project> {
  const { rows } = await pool.query<Project>(
    'INSERT INTO projects (name, organization_id) VALUES ($1, $2) RETURNING *',
    [project.name, project.organization_id],
  );
  return rows[0];
}

export async function updateProject(id: string, project: ProjectUpdate): Promise<void> {
  await pool.query('UPDATE projects SET name = $1 WHERE id = $2', [project.name, id]);
}

export async function removeProject(id: string): Promise<void> {
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
}

export async function getColumns(projectId?: string): Promise<Column[]> {
  if (projectId) {
    const { rows } = await pool.query<Column>(
      'SELECT * FROM columns WHERE project_id = $1 ORDER BY position ASC',
      [projectId],
    );
    return rows;
  }
  const { rows } = await pool.query<Column>('SELECT * FROM columns ORDER BY position ASC');
  return rows;
}

export async function getColumn(id: string): Promise<Column | undefined> {
  const { rows } = await pool.query<Column>('SELECT * FROM columns WHERE id = $1', [id]);
  return rows[0];
}

export async function storeColumn(column: NewColumn): Promise<Column> {
  const { rows } = await pool.query<Column>(
    'INSERT INTO columns (name, project_id) VALUES ($1, $2) RETURNING *',
    [column.name, column.project_id],
  );
  return rows[0];
}

export async function updateColumn(id: string, column: ColumnUpdate): Promise<void> {
  await pool.query('UPDATE columns SET name = $1, position = $2 WHERE id = $3', [
    column.name,
    column.position,
    id,
  ]);
}

export async function removeColumn(id: string): Promise<void> {
  await pool.query('DELETE FROM columns WHERE id = $1', [id]);
}

export async function getOrganizations(): Promise<Organization[]> {
  const { rows } = await pool.query<Organization>(
    'SELECT * FROM organizations order by "createdAt" DESC',
  );
  return rows;
}

export async function getOrganization(id: string): Promise<Organization | undefined> {
  const { rows } = await pool.query<Organization>('SELECT * FROM organizations WHERE id = $1', [
    id,
  ]);
  return rows[0];
}

export async function storeOrganization(organization: NewOrganization): Promise<Organization> {
  const { rows } = await pool.query<Organization>(
    'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
    [organization.name],
  );
  return rows[0];
}

export async function updateOrganization(
  id: string,
  organization: OrganizationUpdate,
): Promise<void> {
  await pool.query('UPDATE organizations SET name = $1 WHERE id = $2', [organization.name, id]);
}

export async function removeOrganization(id: string): Promise<void> {
  await pool.query('DELETE FROM organizations WHERE id = $1', [id]);
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const { rows } = await pool.query<OrganizationMember>(
    'SELECT * FROM organization_members WHERE organization_id = $1 order by "createdAt" ASC',
    [organizationId],
  );
  return rows;
}

export async function getOrganizationMember(id: string): Promise<OrganizationMember | undefined> {
  const { rows } = await pool.query<OrganizationMember>(
    'SELECT * FROM organization_members WHERE id = $1',
    [id],
  );
  return rows[0];
}

export async function storeOrganizationMember(
  member: NewOrganizationMember,
): Promise<OrganizationMember> {
  const { rows } = await pool.query<OrganizationMember>(
    'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
    [member.organization_id, member.user_id, member.role ?? 'member'],
  );
  return rows[0];
}

export async function updateOrganizationMember(
  id: string,
  member: OrganizationMemberUpdate,
): Promise<void> {
  await pool.query('UPDATE organization_members SET role = $1 WHERE id = $2', [member.role, id]);
}

export async function removeOrganizationMember(id: string): Promise<void> {
  await pool.query('DELETE FROM organization_members WHERE id = $1', [id]);
}

async function storeUser(user: User): Promise<User> {
  const { rows }: QueryResult<User> = await pool.query(
    'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING *',
    [user.id, user.email, user.password],
  );
  return rows[0];
}

async function getUser(email: string): Promise<User | undefined> {
  const { rows }: QueryResult<User> = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return rows[0];
}

async function getItemsByUserId(userId: string): Promise<Task[]> {
  const { rows }: QueryResult<Task> = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY "createdAt" DESC',
    [userId],
  );
  return rows;
}

export {
  init,
  teardown,
  getItems,
  getItem,
  getItemsByUserId,
  storeItem,
  updateItem,
  removeItem,
  storeUser,
  getUser,
};
