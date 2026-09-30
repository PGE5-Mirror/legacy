import React, { useEffect, useState } from 'react';

import { apiRequest } from '../api';
import { Organization, Project } from '../types';

interface HomeScreenProps {
  onOpenProject: (projectId: string) => void;
  onOpenWorkspace: () => void;
  onOpenProfile: () => void;
}

export function HomeScreen({ onOpenProject, onOpenWorkspace, onOpenProfile }: HomeScreenProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  );

  const lastProjectId = localStorage.getItem('lastProjectId');
  const lastProject = projects.find((project) => project.id === lastProjectId);

  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      setError('');

      try {
        const organizationList = await apiRequest<Organization[]>('/organizations');

        setOrganizations(organizationList);

        const savedOrganizationId = localStorage.getItem('lastOrganizationId');

        const initialOrganization =
          organizationList.find((organization) => organization.id === savedOrganizationId) ||
          organizationList[0];

        if (initialOrganization) {
          setSelectedOrganizationId(initialOrganization.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your workspace');
        setLoading(false);
      }
    };

    void loadOrganizations();
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) return;

    const loadProjects = async () => {
      setLoading(true);
      setError('');

      try {
        localStorage.setItem('lastOrganizationId', selectedOrganizationId);

        const projectList = await apiRequest<Project[]>(
          `/organizations/${selectedOrganizationId}/projects`,
        );

        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, [selectedOrganizationId]);

  const openProject = (projectId: string) => {
    localStorage.setItem('lastProjectId', projectId);
    onOpenProject(projectId);
  };

  return (
    <div className="taskflow-app home-app">
      <header className="taskflow-header">
        <strong className="taskflow-logo">TaskFlow</strong>

        <div className="taskflow-header-actions">
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
            <span className="home-eyebrow">Personal workspace</span>

            <h1>Welcome back</h1>

            <p>Choose a project and keep your work moving forward.</p>
          </div>
        </section>

        <section className="home-toolbar">
          <div>
            <span className="home-toolbar-label">Organization</span>

            <strong>{selectedOrganization?.name || 'No organization'}</strong>
          </div>

          {organizations.length > 0 && (
            <select
              value={selectedOrganizationId}
              onChange={(event) => setSelectedOrganizationId(event.target.value)}
              aria-label="Select organization"
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          )}
        </section>

        {error && <div className="alert alert-danger">{error}</div>}

        {lastProject && !loading && (
          <section className="home-continue">
            <div className="home-continue-icon">
              <i className="fa fa-clock-o" />
            </div>

            <div>
              <small>Continue where you left off</small>
              <h2>{lastProject.name}</h2>
            </div>

            <button type="button" onClick={() => openProject(lastProject.id)}>
              Continue
              <i className="fa fa-arrow-right" />
            </button>
          </section>
        )}

        <section className="home-projects">
          <div className="home-section-heading">
            <div>
              <h2>Your projects</h2>
              <p>Select a project to open its Kanban board.</p>
            </div>

            <span className="home-project-count">{projects.length} projects</span>
          </div>

          {loading ? (
            <div className="home-state">
              <i className="fa fa-circle-o-notch fa-spin" />
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="home-state">
              <i className="fa fa-folder-open-o" />
              <h3>No projects yet</h3>
              <p>Select another organization to view its projects.</p>
              <button type="button" className="home-create-project" onClick={onOpenWorkspace}>
                <i className="fa fa-plus" />
                Create project
              </button>
            </div>
          ) : (
            <div className="home-project-grid">
              {projects.map((project, index) => (
                <button
                  type="button"
                  key={project.id}
                  className="home-project-card"
                  onClick={() => openProject(project.id)}
                >
                  <span className={`home-project-icon home-project-icon-${index % 3}`}>
                    <i className="fa fa-folder" />
                  </span>

                  <span className="home-project-copy">
                    <strong>{project.name}</strong>
                    <small>Open Kanban board</small>
                  </span>

                  <i className="fa fa-chevron-right home-project-arrow" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
