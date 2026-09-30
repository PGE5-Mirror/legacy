import { OrganizationUpdate } from '../models/Organization';
import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

export interface Organization {
  id?: string;
  name: string;
  createdAt?: string;
}

async function createOrganization(data: Organization) {
  const organization = {
    id: uuid(),
    name: data.name,
    createdAt: new Date(),
  };
  return await db.storeOrganization(organization);
}

async function removeOrganization(id: string) {
  const organization = await db.getOrganization(id);
  await db.removeOrganization(id);
  return organization;
}

async function getOrganizationById(id: string) {
  return await db.getOrganization(id);
}

async function getOrganizations() {
  return await db.getOrganizations();
}

async function updateOrganization(id: string, data: OrganizationUpdate) {
  return await db.updateOrganization(id, data);
}

async function isOrganizationAdmin(organizationId: string, userId: string) {
  const membership = await db.getOrganizationMembership(organizationId, userId);

  return membership?.role === 'admin';
}

export {
  createOrganization,
  removeOrganization,
  getOrganizationById,
  getOrganizations,
  updateOrganization,
  isOrganizationAdmin,
};
