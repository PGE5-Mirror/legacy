import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { apiRequest as request } from '../api';
import { Organization, OrganizationMember, Project, UserSummary } from '../types';

interface OrganizationPageProps {
  onBackHome: () => void;
  onOpenProject: (projectId: string, organizationId?: string) => void;
  onOpenProfile: () => void;
}

export function OrganizationPage({
  onBackHome,
  onOpenProject,
  onOpenProfile,
}: OrganizationPageProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  );

  const availableUsers = useMemo(
    () => users.filter((user) => !members.some((member) => member.user_id === user.id)),
    [members, users],
  );

  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      setError('');

      try {
        const organizationList = await request<Organization[]>('/organizations');
        setOrganizations(organizationList);

        const preferredOrganizationId =
          localStorage.getItem('lastOrganizationId') || organizationList[0]?.id || '';

        if (preferredOrganizationId) {
          setSelectedOrganizationId(preferredOrganizationId);
        } else {
          setSelectedOrganizationId('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load organizations');
      } finally {
        setLoading(false);
      }
    };

    void loadOrganizations();
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setProjects([]);
      setMembers([]);
      setUsers([]);
      return;
    }

    const loadOrganizationDetails = async () => {
      setLoading(true);
      setError('');

      try {
        localStorage.setItem('lastOrganizationId', selectedOrganizationId);

        const [projectList, memberList, userList] = await Promise.all([
          request<Project[]>(`/organizations/${selectedOrganizationId}/projects`),
          request<OrganizationMember[]>(`/organizations/${selectedOrganizationId}/members`),
          request<UserSummary[]>('/users'),
        ]);

        setProjects(projectList);
        setMembers(memberList);
        setUsers(userList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load organization details');
      } finally {
        setLoading(false);
      }
    };

    void loadOrganizationDetails();
  }, [selectedOrganizationId]);

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!organizationName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const createdOrganization = await request<Organization>('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: organizationName.trim() }),
      });

      setOrganizations((current) => [...current, createdOrganization]);
      setSelectedOrganizationId(createdOrganization.id);
      setOrganizationName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create organization');
    } finally {
      setSaving(false);
    }
  };

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedOrganizationId || !projectName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const createdProject = await request<Project>(`/organizations/${selectedOrganizationId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name: projectName.trim() }),
      });

      setProjects((current) => [...current, createdProject]);
      setProjectName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create project');
    } finally {
      setSaving(false);
    }
  };

  const inviteUser = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedOrganizationId || !selectedUserId) return;

    setSaving(true);
    setError('');

    try {
      const createdMember = await request<OrganizationMember>(
        `/organizations/${selectedOrganizationId}/members`,
        {
          method: 'POST',
          body: JSON.stringify({ user_id: selectedUserId }),
        },
      );

      setMembers((current) => [...current, createdMember]);
      setSelectedUserId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add member');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (member: OrganizationMember) => {
    if (!selectedOrganizationId) return;

    if (!window.confirm(`Remove ${userEmail(member.user_id)} from this organization?`)) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await request<void>(`/organizations/${selectedOrganizationId}/members/${member.id}`, {
        method: 'DELETE',
      });

      setMembers((current) => current.filter((currentMember) => currentMember.id !== member.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove member');
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedOrganization = async () => {
    if (!selectedOrganizationId) return;

    const organization = organizations.find((item) => item.id === selectedOrganizationId);
    const confirmed = window.confirm(
      `Delete "${organization?.name || 'this organization'}"? All projects, columns and tasks will be deleted.`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      await request<void>(`/organizations/${selectedOrganizationId}`, {
        method: 'DELETE',
      });

      const remainingOrganizations = organizations.filter(
        (organizationItem) => organizationItem.id !== selectedOrganizationId,
      );

      setOrganizations(remainingOrganizations);
      const nextSelection = remainingOrganizations[0]?.id || '';
      setSelectedOrganizationId(nextSelection);
      if (!nextSelection) {
        localStorage.removeItem('lastOrganizationId');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete organization');
    } finally {
      setSaving(false);
    }
  };

  const userEmail = (userId: string) =>
    users.find((user) => user.id === userId)?.email || 'Unknown user';

  return (
    <div className="taskflow-app home-app">
      <header className="taskflow-header">
        <strong className="taskflow-logo">TaskFlow</strong>

        <div className="taskflow-header-actions">
          <button type="button" className="taskflow-sidebar-link" onClick={onBackHome}>
            <i className="fa fa-home" />
            Home
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

      <main className="home-screen">
        <section className="home-hero">
          <div>
            <span className="home-eyebrow">Organization workspace</span>
            <h1>Organizations</h1>
            <p>Manage your organizations, members, and projects from one dedicated page.</p>
          </div>
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        <section className="home-toolbar">
          <div>
            <span className="home-toolbar-label">Current organization</span>
            <strong>{selectedOrganization?.name || 'None selected'}</strong>
          </div>
        </section>

        <div className="row" style={{ gap: '1rem', marginTop: '1rem' }}>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Your organizations</strong>
              </div>
              <div className="card-body">
                {loading && organizations.length === 0 ? (
                  <p>Loading organizations...</p>
                ) : organizations.length === 0 ? (
                  <p>No organization yet.</p>
                ) : (
                  <div className="list-group">
                    {organizations.map((organization) => (
                      <button
                        key={organization.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          selectedOrganizationId === organization.id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedOrganizationId(organization.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{organization.name}</span>
                          <span className="badge badge-light">
                            {projects.filter((project) => project.organization_id === organization.id).length}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header">
                <strong>{selectedOrganization ? selectedOrganization.name : 'Create organization'}</strong>
              </div>
              <div className="card-body">
                <Form onSubmit={createOrganization} className="mb-4">
                  <Form.Group controlId="organizationName">
                    <Form.Label>Create organization</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        value={organizationName}
                        onChange={(event) => setOrganizationName(event.target.value)}
                        placeholder="Organization name"
                        required
                      />
                      <Button type="submit" className="ml-2" disabled={saving || !organizationName.trim()}>
                        Create
                      </Button>
                    </div>
                  </Form.Group>
                </Form>

                {!selectedOrganization ? (
                  <p>Select an organization to see its projects and members.</p>
                ) : (
                  <>
                    <Form onSubmit={createProject} className="mb-4">
                      <Form.Group controlId="projectName">
                        <Form.Label>Create project</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            value={projectName}
                            onChange={(event) => setProjectName(event.target.value)}
                            placeholder="Project name"
                            required
                          />
                          <Button
                            type="submit"
                            className="ml-2"
                            disabled={saving || !selectedOrganizationId || !projectName.trim()}
                          >
                            Create
                          </Button>
                        </div>
                      </Form.Group>
                    </Form>

                    <div className="mb-4">
                      <h6>Projects</h6>
                      {loading ? (
                        <p>Loading projects...</p>
                      ) : projects.length === 0 ? (
                        <p>No projects yet.</p>
                      ) : (
                        <div className="list-group">
                          {projects.map((project) => (
                            <button
                              type="button"
                              key={project.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                              onClick={() => onOpenProject(project.id, selectedOrganization.id)}
                            >
                              <span>{project.name}</span>
                              <i className="fa fa-arrow-right" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <h6>Members</h6>
                      {members.length === 0 ? (
                        <p>No members found.</p>
                      ) : (
                        <ul className="list-group">
                          {members.map((member) => (
                            <li
                              key={member.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <span>{userEmail(member.user_id)}</span>
                              <div className="d-flex align-items-center">
                                <span className="badge badge-light mr-2">{member.role}</span>
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  disabled={saving}
                                  onClick={() => void removeMember(member)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Form onSubmit={inviteUser} className="mb-4">
                      <Form.Group controlId="inviteUser">
                        <Form.Label>Add a member</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            as="select"
                            value={selectedUserId}
                            onChange={(event) => setSelectedUserId(event.target.value)}
                            disabled={saving || availableUsers.length === 0}
                          >
                            <option value="">
                              {availableUsers.length === 0
                                ? 'All users are already members'
                                : 'Choose a user'}
                            </option>
                            {availableUsers.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.email}
                              </option>
                            ))}
                          </Form.Control>

                          <Button type="submit" className="ml-2" disabled={saving || !selectedUserId}>
                            Add
                          </Button>
                        </div>
                      </Form.Group>
                    </Form>

                    <Button
                      type="button"
                      variant="outline-danger"
                      disabled={saving || !selectedOrganizationId}
                      onClick={() => void deleteSelectedOrganization()}
                    >
                      <i className="fa fa-trash mr-2" />
                      Delete organization
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
