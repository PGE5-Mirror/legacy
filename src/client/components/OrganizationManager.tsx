import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import {
  Organization,
  OrganizationMember,
  UserSummary,
  Project,
} from '../types';

type ApiRequest = <T>(
  url: string,
  options?: RequestInit,
) => Promise<T>;

interface OrganizationManagerProps {
  organizations: Organization[];
  request: ApiRequest;
  onOrganizationCreated: (organization: Organization) => void;
  onProjectCreated: (project: Project) => void;
}

export function OrganizationManager({
  organizations,
  request,
  onOrganizationCreated,
  onProjectCreated,
}: OrganizationManagerProps) {
  const [show, setShow] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const selectedExists = organizations.some(
      (organization) => organization.id === selectedOrganizationId,
    );

    if (!selectedExists) {
      setSelectedOrganizationId(organizations[0]?.id || '');
    }
  }, [organizations, selectedOrganizationId]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.user_id));

    return users.filter((user) => !memberIds.has(user.id));
  }, [members, users]);

  const getUserEmail = (userId: string) =>
    users.find((user) => user.id === userId)?.email || userId;

  const loadMembers = async (organizationId: string) => {
    if (!organizationId) {
      setMembers([]);
      return;
    }

    const memberList = await request<OrganizationMember[]>(
      `/organizations/${organizationId}/members`,
    );

    setMembers(memberList);
  };

  const openManager = async () => {
    const organizationId =
      selectedOrganizationId || organizations[0]?.id || '';

    setShow(true);
    setLoading(true);
    setError('');

    try {
      const [userList, memberList] = await Promise.all([
        request<UserSummary[]>('/users'),
        organizationId
          ? request<OrganizationMember[]>(
              `/organizations/${organizationId}/members`,
            )
          : Promise.resolve([]),
      ]);

      setUsers(userList);
      setMembers(memberList);
      setSelectedOrganizationId(organizationId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load organization data',
      );
    } finally {
      setLoading(false);
    }
  };

  const changeOrganization = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const organizationId = event.target.value;

    setSelectedOrganizationId(organizationId);
    setSelectedUserId('');
    setLoading(true);
    setError('');

    try {
      await loadMembers(organizationId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load members',
      );
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!organizationName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const createdOrganization = await request<Organization>(
        '/organizations',
        {
          method: 'POST',
          body: JSON.stringify({
            name: organizationName.trim(),
          }),
        },
      );

      onOrganizationCreated(createdOrganization);
      setOrganizationName('');
      setSelectedOrganizationId(createdOrganization.id);
      await loadMembers(createdOrganization.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create organization',
      );
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
        const createdProject = await request<Project>(
        `/organizations/${selectedOrganizationId}/projects`,
        {
            method: 'POST',
            body: JSON.stringify({
            name: projectName.trim(),
            }),
        },
        );

        onProjectCreated(createdProject);
        setProjectName('');
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : 'Unable to create project',
        );
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
          body: JSON.stringify({
            user_id: selectedUserId,
          }),
        },
      );

      setMembers((current) => [...current, createdMember]);
      setSelectedUserId('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to add member',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="taskflow-project"
        onClick={() => void openManager()}
      >
        <i className="fa fa-users" />
        Manage organizations
      </button>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Organization management</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={createOrganization}>
            <Form.Group controlId="organizationName">
              <Form.Label>Create organization</Form.Label>
              <div className="d-flex">
                <Form.Control
                  value={organizationName}
                  onChange={(event) =>
                    setOrganizationName(event.target.value)
                  }
                  placeholder="Organization name"
                  required
                />
                <Button
                  type="submit"
                  className="ml-2"
                  disabled={saving || !organizationName.trim()}
                >
                  Create
                </Button>
              </div>
            </Form.Group>
          </Form>

          <hr />

          {organizations.length === 0 ? (
            <p>Create an organization to start building your team.</p>
          ) : (
            <>
              <Form.Group controlId="selectedOrganization">
                <Form.Label>Organization</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedOrganizationId}
                  onChange={changeOrganization}
                  disabled={loading}
                >
                  {organizations.map((organization) => (
                    <option
                      key={organization.id}
                      value={organization.id}
                    >
                      {organization.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

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
                        disabled={
                        saving ||
                        !selectedOrganizationId ||
                        !projectName.trim()
                        }
                    >
                        Create
                    </Button>
                    </div>
                </Form.Group>
                </Form>

              <h6>Current members</h6>

              {loading ? (
                <p>Loading members...</p>
              ) : members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                <ul className="list-group mb-3">
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>{getUserEmail(member.user_id)}</span>
                      <span className="badge badge-light">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Form onSubmit={inviteUser}>
                <Form.Group controlId="inviteUser">
                  <Form.Label>Add a user</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      as="select"
                      value={selectedUserId}
                      onChange={(event) =>
                        setSelectedUserId(event.target.value)
                      }
                      disabled={
                        saving ||
                        loading ||
                        availableUsers.length === 0
                      }
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

                    <Button
                      type="submit"
                      className="ml-2"
                      disabled={saving || !selectedUserId}
                    >
                      Add
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}