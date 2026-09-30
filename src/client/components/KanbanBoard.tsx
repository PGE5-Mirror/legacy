import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { apiRequest as request } from '../api';
import {
  BoardColumn,
  Item,
  Organization,
  OrganizationMember,
  Project,
  TaskPriority,
  UserSummary,
} from '../types';
import { NotificationBell } from './NotificationBell';
import { OrganizationManager } from './OrganizationManager';

interface KanbanBoardProps {
  onOpenProfile: () => void;
}

type TasksByColumn = Record<string, Item[]>;

export function KanbanBoard({ onOpenProfile }: KanbanBoardProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [columnName, setColumnName] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDeadline, setTaskDeadline] = useState('');

  const createColumn = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeProject || !columnName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const createdColumn = await request<BoardColumn>('/columns', {
        method: 'POST',
        body: JSON.stringify({
          name: columnName.trim(),
          project_id: activeProject.id,
        }),
      });

      setColumns((current) => [...current, createdColumn]);
      setTasksByColumn((current) => ({
        ...current,
        [createdColumn.id]: [],
      }));
      setColumnName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create column');
    } finally {
      setSaving(false);
    }
  };

  const loadProject = useCallback(async (project: Project) => {
    setLoading(true);
    setError('');
    setActiveProject(project);

    try {
      if (project.organization_id) {
        const memberList = await request<OrganizationMember[]>(
          `/organizations/${project.organization_id}/members`,
        );
        setMembers(memberList);
      }

      const projectColumns = await request<BoardColumn[]>(
        `/columns?project_id=${encodeURIComponent(project.id)}`,
      );
      const orderedColumns = [...projectColumns].sort((a, b) => a.position - b.position);
      const taskEntries = await Promise.all(
        orderedColumns.map(async (column) => {
          const tasks = await request<Item[]>(`/columns/${column.id}/tasks`);
          return [column.id, [...tasks].sort((a, b) => a.position - b.position)] as const;
        }),
      );
      const groupedTasks = taskEntries.reduce<TasksByColumn>((result, [columnId, tasks]) => {
        result[columnId] = tasks;
        return result;
      }, {});

      setColumns(orderedColumns);
      setTasksByColumn(groupedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load board');
      setColumns([]);
      setTasksByColumn({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      setError('');

      try {
        const organizationList = await request<Organization[]>('/organizations');
        setOrganizations(organizationList);

        const organization = organizationList[0];
        setActiveOrganization(organization || null);

        if (!organization) {
          setProjects([]);
          setMembers([]);
          setColumns([]);
          setTasksByColumn({});
          setError('No organization is available.');
          return;
        }

        const [projectList, memberList, userList] = await Promise.all([
          request<Project[]>(`/organizations/${organization.id}/projects`),
          request<OrganizationMember[]>(`/organizations/${organization.id}/members`),
          request<UserSummary[]>('/users'),
        ]);

        setUsers(userList);
        setProjects(projectList);
        setMembers(memberList);

        if (projectList[0]) {
          await loadProject(projectList[0]);
        } else {
          setActiveProject(null);
          setColumns([]);
          setTasksByColumn({});
          setError('No project is available.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load workspace');
      } finally {
        setLoading(false);
      }
    };

    void loadWorkspace();
  }, [loadProject]);

  const openTaskForm = (columnId: string) => {
    setSelectedColumnId(columnId);
    setTaskName('');
    setAssignedTo('');
    setTaskPriority('medium');
    setTaskDeadline('');
    setShowTaskForm(true);
  };

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!taskName.trim() || !selectedColumnId) return;

    setSaving(true);
    setError('');

    try {
      const position = tasksByColumn[selectedColumnId]?.length || 0;
      const createdTask = await request<Item>('/items', {
        method: 'POST',
        body: JSON.stringify({
          name: taskName.trim(),
          column_id: selectedColumnId,
          assigned_to: assignedTo || null,
          position,
          priority: taskPriority,
          deadline: taskDeadline || null,
        }),
      });

      setTasksByColumn((current) => ({
        ...current,
        [selectedColumnId]: [...(current[selectedColumnId] || []), createdTask],
      }));
      setShowTaskForm(false);
      setTaskName('');
      setAssignedTo('');
      setTaskPriority('medium');
      setTaskDeadline('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task');
    } finally {
      setSaving(false);
    }
  };

  const moveTask = async (task: Item, destinationColumnId: string) => {
    if (!task.column_id || task.column_id === destinationColumnId) return;

    setError('');

    try {
      const position = tasksByColumn[destinationColumnId]?.length || 0;
      const updatedTask = await request<Item>(`/items/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ column_id: destinationColumnId, position }),
      });

      setTasksByColumn((current) => {
        const next: TasksByColumn = {};

        Object.keys(current).forEach((columnId) => {
          next[columnId] = current[columnId].filter((currentTask) => currentTask.id !== task.id);
        });
        next[destinationColumnId] = [...(next[destinationColumnId] || []), updatedTask].sort(
          (a, b) => a.position - b.position,
        );

        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to move task');
    }
  };

  const assignTask = async (task: Item, userId: string) => {
    setError('');

    try {
      const updatedTask = await request<Item>(`/items/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ assigned_to: userId || null }),
      });

      setTasksByColumn((current) => ({
        ...current,
        [task.column_id || '']: (current[task.column_id || ''] || []).map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign task');
    }
  };

  const deleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? All its columns and tasks will also be deleted.`,
    );

    if (!confirmed) return;

    setError('');

    try {
      await request<void>(`/projects/${project.id}`, { method: 'DELETE' });
      const remainingProjects = projects.filter(
        (currentProject) => currentProject.id !== project.id,
      );
      setProjects(remainingProjects);

      if (activeProject?.id === project.id) {
        setActiveProject(null);
        setColumns([]);
        setTasksByColumn({});

        if (remainingProjects[0]) {
          await loadProject(remainingProjects[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete project');
    }
  };

  const updateTaskDeadline = async (task: Item, deadline: string) => {
    setError('');

    try {
      const updatedTask = await request<Item>(`/items/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ deadline: deadline || null }),
      });

      setTasksByColumn((current) => ({
        ...current,
        [task.column_id || '']: (current[task.column_id || ''] || []).map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update deadline');
    }
  };

  const deleteTask = async (task: Item) => {
    if (!window.confirm(`Delete "${task.name}"?`)) return;

    setError('');

    try {
      await request<void>(`/items/${task.id}`, { method: 'DELETE' });
      setTasksByColumn((current) => {
        const next: TasksByColumn = {};

        Object.keys(current).forEach((columnId) => {
          next[columnId] = current[columnId].filter((currentTask) => currentTask.id !== task.id);
        });

        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete task');
    }
  };

  const memberLabel = (userId: string) =>
    users.find((user) => user.id === userId)?.email || 'Unknown user';

  return (
    <div className="taskflow-app">
      <header className="taskflow-header">
        <strong className="taskflow-logo">TaskFlow</strong>

        <div className="taskflow-header-actions">
          <input
            type="search"
            placeholder="Search tasks, projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <NotificationBell />
          <button
            type="button"
            className="taskflow-avatar"
            onClick={onOpenProfile}
            aria-label="Open profile"
          >
            <i className="fa fa-user" />
          </button>
        </div>
      </header>

      <div className="taskflow-layout">
        <aside className="taskflow-sidebar">
          <div className="taskflow-sidebar-link active">
            <i className="fa fa-th-large" />
            Dashboard
          </div>

          <div className="taskflow-sidebar-title">Projects</div>

          {projects.map((project) => (
            <div key={project.id} className="taskflow-project-row">
              <button
                type="button"
                className={
                  activeProject?.id === project.id ? 'taskflow-project active' : 'taskflow-project'
                }
                onClick={() => void loadProject(project)}
              >
                <i className="fa fa-folder" />
                {project.name}
              </button>
              <button
                type="button"
                className="taskflow-project-delete"
                onClick={() => void deleteProject(project)}
                aria-label={`Delete ${project.name}`}
                title="Delete project"
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          ))}

          <OrganizationManager
            organizations={organizations}
            request={request}
            onOrganizationCreated={(organization) => {
              setOrganizations((current) => [...current, organization]);
              setActiveOrganization(organization);
            }}
            onProjectCreated={(project) => {
              setProjects((current) => [...current, project]);
              void loadProject(project);
            }}
            onOrganizationDeleted={(organizationId) => {
              setOrganizations((current) =>
                current.filter((organization) => organization.id !== organizationId),
              );

              if (activeOrganization?.id === organizationId) {
                setActiveOrganization(null);
                setProjects([]);
                setActiveProject(null);
                setMembers([]);
                setColumns([]);
                setTasksByColumn({});
              }
            }}
          />

          <div className="taskflow-sidebar-spacer" />
          <div className="taskflow-sidebar-link">
            <i className="fa fa-tasks" />
            My tasks
          </div>
          <div className="taskflow-sidebar-link">
            <i className="fa fa-cog" />
            Settings
          </div>
        </aside>

        <main className="taskflow-main">
          <div className="taskflow-board-heading">
            <div>
              <h1>{activeProject?.name || 'Project board'}</h1>
              <p>Kanban Board · {members.length} members</p>
            </div>

            {activeProject && (
              <form onSubmit={createColumn} className="taskflow-create-column">
                <div className="taskflow-column-input">
                  <i className="fa fa-columns" />
                  <input
                    type="text"
                    value={columnName}
                    onChange={(event) => setColumnName(event.target.value)}
                    placeholder="New column name"
                    aria-label="New column name"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="taskflow-add-column-button"
                  disabled={saving || !columnName.trim()}
                >
                  <i className="fa fa-plus" />
                  {saving ? 'Adding...' : 'Add column'}
                </button>
              </form>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p className="taskflow-loading">Loading board...</p>
          ) : columns.length === 0 ? (
            <p className="taskflow-empty">No columns are available.</p>
          ) : (
            <div className="kanban-board">
              {columns.map((column, columnIndex) => {
                const tasks = (tasksByColumn[column.id] || []).filter((task) =>
                  task.name.toLowerCase().includes(search.toLowerCase()),
                );

                return (
                  <section
                    key={column.id}
                    className={`kanban-column kanban-column-${columnIndex % 3}`}
                  >
                    <div className="kanban-column-heading">
                      <h2>
                        <span className="kanban-column-dot" />
                        {column.name}
                      </h2>
                      <span>{tasks.length}</span>
                    </div>

                    <div className="kanban-task-list">
                      {tasks.map((task) => (
                        <article key={task.id} className="kanban-task-card">
                          <h3>{task.name}</h3>

                          <div className="kanban-task-meta">
                            <span
                              className={`task-priority task-priority-${task.priority || 'medium'}`}
                            >
                              {(task.priority || 'medium').charAt(0).toUpperCase() +
                                (task.priority || 'medium').slice(1)}
                            </span>
                            <label className="task-deadline-editor">
                              <i className="fa fa-calendar" />
                              <input
                                type="date"
                                value={task.deadline?.split('T')[0] || ''}
                                onChange={(event) =>
                                  void updateTaskDeadline(task, event.target.value)
                                }
                                aria-label="Task deadline"
                              />
                            </label>
                          </div>

                          <label>
                            Assignee
                            <select
                              value={task.assigned_to || ''}
                              onChange={(event) => void assignTask(task, event.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {members.map((member) => (
                                <option key={member.id} value={member.user_id}>
                                  {memberLabel(member.user_id)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            Move to
                            <select
                              value={task.column_id || ''}
                              onChange={(event) => void moveTask(task, event.target.value)}
                            >
                              {columns.map((destinationColumn) => (
                                <option key={destinationColumn.id} value={destinationColumn.id}>
                                  {destinationColumn.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            type="button"
                            className="kanban-delete-task"
                            onClick={() => void deleteTask(task)}
                            aria-label={`Delete ${task.name}`}
                            title="Delete task"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </article>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="kanban-add-task"
                      onClick={() => openTaskForm(column.id)}
                    >
                      <i className="fa fa-plus" />
                      Add Task
                    </button>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered>
        <Form onSubmit={createTask}>
          <Modal.Header closeButton>
            <Modal.Title>Create task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="taskName">
              <Form.Label>Task name</Form.Label>
              <Form.Control
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="Enter task name"
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group controlId="taskPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="taskDeadline">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="date"
                value={taskDeadline}
                onChange={(event) => setTaskDeadline(event.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="taskAssignee">
              <Form.Label>Assignee</Form.Label>
              <Form.Control
                as="select"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {memberLabel(member.user_id)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowTaskForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !taskName.trim()}>
              {saving ? 'Creating...' : 'Create task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
