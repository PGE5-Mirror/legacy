import { Pool, QueryResult } from 'pg';
import { Task, NewTask, TaskUpdate } from '../models/Task';
import { Project, NewProject, ProjectUpdate } from '../models/Project';
import { Column, NewColumn, ColumnUpdate } from '../models/Column';
import { Organization, NewOrganization, OrganizationUpdate } from '../models/Organization';
import { User, UserExport } from '../models/User';

import {
  OrganizationMember,
  NewOrganizationMember,
  OrganizationMemberUpdate,
} from '../models/OrganizationMember';
import { UserSettings, UserSettingsUpdate } from '../models/UserSettings';

interface Notification {
  id?: string;
  userId: string;
  message: string;
  read?: boolean;
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

async function getItemsByColumnId(columnId: string): Promise<Task[]> {
  const { rows }: QueryResult<Task> = await pool.query(
    `SELECT *
     FROM tasks
     WHERE column_id = $1
     ORDER BY position ASC, "createdAt" ASC`,
    [columnId],
  );

  return rows;
}

async function storeItem(item: NewTask): Promise<Task> {
  const { rows }: QueryResult<Task> = await pool.query(
    `INSERT INTO tasks
      (name, user_id, column_id, assigned_to, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      item.name,
      item.user_id,
      item.column_id ?? null,
      item.assigned_to ?? null,
      item.position ?? 0,
    ],
  );

  return rows[0];
}

async function updateItem(id: string, item: TaskUpdate): Promise<Task | undefined> {
  const fields: string[] = [];
  const values: unknown[] = [];

  const addField = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`${column} = $${values.length}`);
  };

  if (item.name !== undefined) addField('name', item.name);
  if (item.completed !== undefined) addField('completed', item.completed);
  if (item.column_id !== undefined) addField('column_id', item.column_id);
  if (item.assigned_to !== undefined) addField('assigned_to', item.assigned_to);
  if (item.position !== undefined) addField('position', item.position);

  if (fields.length === 0) {
    return getItem(id);
  }

  values.push(id);

  const { rows }: QueryResult<Task> = await pool.query(
    `UPDATE tasks
     SET ${fields.join(', ')}
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  return rows[0];
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

export async function getUserById(id: string): Promise<UserExport | undefined> {
  const { rows }: QueryResult<UserExport> = await pool.query(
      'SELECT id, email, "createdAt", tos_accepted_at, tos_version FROM users WHERE id = $1',
      [id],
  );
  return rows[0];
}

async function getUserOrganizations(userId: string) {
  const { rows } = await pool.query(
      `SELECT o.id, o.name, om.role, om."createdAt" as joined_at
     FROM organization_members om
     JOIN organizations o ON o.id = om.organization_id
     WHERE om.user_id = $1`,
      [userId],
  );
  return rows;
}

async function getUserExportData(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  const tasks = await getItemsByUserId(userId);
  const organizations = await getUserOrganizations(userId);

  return {
    user: user,
    organizations,
    tasks,
    exportedAt: new Date().toISOString(),
  };
}

async function deleteUser(id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

async function getItemsByUserId(userId: string): Promise<Task[]> {
  const { rows }: QueryResult<Task> = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY "createdAt" DESC',
    [userId],
  );
  return rows;
}

async function getUserSettings(userId: string): Promise<UserSettings | undefined> {
  const { rows }: QueryResult<UserSettings> = await pool.query(
    'SELECT * FROM user_settings WHERE user_id = $1',
    [userId],
  );
  return rows[0];
}

async function upsertUserSettings(
  userId: string,
  settings: UserSettingsUpdate,
): Promise<UserSettings> {
  const existingSettings = await getUserSettings(userId);
  if (existingSettings) {
    const updatedSettings: UserSettingsUpdate = {
      high_contrast: settings.high_contrast ?? existingSettings.high_contrast,
      font_size: settings.font_size ?? existingSettings.font_size,
    };
    const { rows }: QueryResult<UserSettings> = await pool.query(
      'UPDATE user_settings SET high_contrast = $1, font_size = $2, "updatedAt" = current_timestamp WHERE user_id = $3 RETURNING *',
      [updatedSettings.high_contrast, updatedSettings.font_size, userId],
    );
    return rows[0];
  } else {
    const { rows }: QueryResult<UserSettings> = await pool.query(
      'INSERT INTO user_settings (user_id, high_contrast, font_size) VALUES ($1, $2, $3) RETURNING *',
      [userId, settings.high_contrast ?? false, settings.font_size ?? 'medium'],
    );
    return rows[0];
  }
}

async function createNotification(notification: Notification): Promise<Notification> {
  const { rows }: QueryResult<Notification> = await pool.query(
    'INSERT INTO notifications (id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
    [notification.id, notification.userId, notification.message],
  );
  return rows[0];
}

async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const { rows }: QueryResult<Notification> = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY "createdAt" DESC',
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
  getItemsByColumnId,
  storeItem,
  updateItem,
  removeItem,
  storeUser,
  getUser,
  getUserSettings,
  upsertUserSettings,
  getUserExportData,
  deleteUser,
  createNotification,
  getNotificationsByUserId,
};
