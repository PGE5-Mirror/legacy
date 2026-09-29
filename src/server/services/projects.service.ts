import { NewProject, ProjectUpdate } from '../models/Project';
import * as db from '../persistence';

async function createProject(data: NewProject) {
    return await db.storeProject({
        name: data.name,
        organization_id: data.organization_id,
    });
}

async function removeProject(id: string) {
    const project = await db.getProject(id);
    await db.removeProject(id);
    return project;
}

async function getProjectById(id: string) {
    return await db.getProject(id);
}

async function getProjects(organizationId: string) {
    return await db.getProjects(organizationId);
}

async function updateProject(id: string, data: ProjectUpdate) {
    return await db.updateProject(id, data);
}

export {
    createProject,
    removeProject,
    getProjects,
    getProjectById,
    updateProject,
}