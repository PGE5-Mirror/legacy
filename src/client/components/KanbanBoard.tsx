import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import {
    BoardColumn,
    Item,
    Organization,
    OrganizationMember,
    Project,
} from '../types';

interface KanbanBoardProps {
    token: string;
    onOpenProfile: () => void;
}

type TasksByColumn = Record<string, Item[]>;

export function KanbanBoard({ token, onOpenProfile }: KanbanBoardProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [columns, setColumns] = useState<BoardColumn[]>([]);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState('');
    const [taskName, setTaskName] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [saving, setSaving] = useState(false);

    const request = useCallback(
        async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                window.location.reload();
                throw new Error('Session expired');
            }

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'Request failed');
            }

            return response.json() as Promise<T>;
        },
        [token],
    );

    const loadProject = useCallback(
        async (project: Project) => {
            setLoading(true);
            setError('');
            setActiveProject(project);

            try {
                const projectColumns = await request<BoardColumn[]>(
                    `/columns?project_id=${encodeURIComponent(project.id)}`,
                );

                const orderedColumns = [...projectColumns].sort(
                    (a, b) => a.position - b.position,
                );

                const taskEntries = await Promise.all(
                    orderedColumns.map(async (column) => {
                        const tasks = await request<Item[]>(
                            `/columns/${column.id}/tasks`,
                        );

                        return [
                            column.id,
                            [...tasks].sort((a, b) => a.position - b.position),
                        ] as const;
                    }),
                );

               const groupedTasks = taskEntries.reduce<TasksByColumn>(
                (result, [columnId, tasks]) => {
                    result[columnId] = tasks;
                    return result;
                },
                {},
            );

            setColumns(orderedColumns);
            setTasksByColumn(groupedTasks);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load board');
                setColumns([]);
                setTasksByColumn({});
            } finally {
                setLoading(false);
            }
        },
        [request],
    );

    useEffect(() => {
        const loadWorkspace = async () => {
            setLoading(true);
            setError('');

            try {
                const organizationList = await request<Organization[]>('/organizations');
                setOrganizations(organizationList);

                const organization = organizationList[0];

                if (!organization) {
                    setError('No organization is available.');
                    return;
                }

                const [projectList, memberList] = await Promise.all([
                    request<Project[]>(`/organizations/${organization.id}/projects`),
                    request<OrganizationMember[]>(
                        `/organizations/${organization.id}/members`,
                    ),
                ]);

                setProjects(projectList);
                setMembers(memberList);

                if (projectList[0]) {
                    await loadProject(projectList[0]);
                } else {
                    setError('No project is available.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load workspace');
            } finally {
                setLoading(false);
            }
        };

        void loadWorkspace();
    }, [loadProject, request]);

    const openTaskForm = (columnId: string) => {
        setSelectedColumnId(columnId);
        setTaskName('');
        setAssignedTo('');
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
                }),
            });

            setTasksByColumn((current) => ({
                ...current,
                [selectedColumnId]: [
                    ...(current[selectedColumnId] || []),
                    createdTask,
                ],
            }));

            setShowTaskForm(false);
            setTaskName('');
            setAssignedTo('');
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
                body: JSON.stringify({
                    column_id: destinationColumnId,
                    position,
                }),
            });

            setTasksByColumn((current) => {
                const next: TasksByColumn = {};

                Object.keys(current).forEach((columnId) => {
                    next[columnId] = current[columnId].filter(
                        (currentTask) => currentTask.id !== task.id,
                    );
                });

                next[destinationColumnId] = [
                    ...(next[destinationColumnId] || []),
                    updatedTask,
                ].sort((a, b) => a.position - b.position);

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
                body: JSON.stringify({
                    assigned_to: userId || null,
                }),
            });

            setTasksByColumn((current) => ({
                ...current,
                [task.column_id || '']: (current[task.column_id || ''] || []).map(
                    (currentTask) =>
                        currentTask.id === updatedTask.id ? updatedTask : currentTask,
                ),
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to assign task');
        }
    };

    const memberLabel = (userId: string) =>
        `Member ${userId.slice(0, 8)}`;

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

                    <button
                        type="button"
                        className="taskflow-icon-button"
                        aria-label="Notifications"
                    >
                        <i className="fa fa-bell" />
                    </button>

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
                    <div className="taskflow-dashboard-link">
                        <i className="fa fa-th-large" />
                        Dashboard
                    </div>

                    <p className="taskflow-sidebar-title">Projects</p>

                    {projects.map((project) => (
                        <button
                            key={project.id}
                            type="button"
                            className={
                                activeProject?.id === project.id
                                    ? 'taskflow-project active'
                                    : 'taskflow-project'
                            }
                            onClick={() => void loadProject(project)}
                        >
                            <i className="fa fa-folder" />
                            {project.name}
                        </button>
                    ))}

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
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <p className="taskflow-loading">Loading board...</p>
                    ) : columns.length === 0 ? (
                        <p className="taskflow-empty">No columns are available.</p>
                    ) : (
                        <div className="kanban-board">
                            {columns.map((column, columnIndex) => {
                                const tasks = (tasksByColumn[column.id] || []).filter(
                                    (task) =>
                                        task.name
                                            .toLowerCase()
                                            .includes(search.toLowerCase()),
                                );

                                return (
                                    <section
                                        key={column.id}
                                        className={`kanban-column kanban-column-${
                                            columnIndex % 3
                                        }`}
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
                                                <article
                                                    key={task.id}
                                                    className="kanban-task-card"
                                                >
                                                    <h3>{task.name}</h3>

                                                    <label>
                                                        Assignee
                                                        <select
                                                            value={task.assigned_to || ''}
                                                            onChange={(event) =>
                                                                void assignTask(
                                                                    task,
                                                                    event.target.value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Unassigned
                                                            </option>
                                                            {members.map((member) => (
                                                                <option
                                                                    key={member.id}
                                                                    value={member.user_id}
                                                                >
                                                                    {memberLabel(
                                                                        member.user_id,
                                                                    )}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>

                                                    <label>
                                                        Move to
                                                        <select
                                                            value={task.column_id || ''}
                                                            onChange={(event) =>
                                                                void moveTask(
                                                                    task,
                                                                    event.target.value,
                                                                )
                                                            }
                                                        >
                                                            {columns.map(
                                                                (destinationColumn) => (
                                                                    <option
                                                                        key={
                                                                            destinationColumn.id
                                                                        }
                                                                        value={
                                                                            destinationColumn.id
                                                                        }
                                                                    >
                                                                        {
                                                                            destinationColumn.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </label>
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

            <Modal
                show={showTaskForm}
                onHide={() => setShowTaskForm(false)}
                centered
            >
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
                        <Button
                            variant="light"
                            onClick={() => setShowTaskForm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving || !taskName.trim()}
                        >
                            {saving ? 'Creating...' : 'Create task'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}