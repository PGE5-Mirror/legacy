import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

export interface OrganizationMember {
  id?: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  createdAt?: string;
}

async function createOrganizationMember(data: OrganizationMember) {
    const organizationMember: OrganizationMember = {
        id: uuid(),
        organization_id: data.organization_id,
        user_id: data.user_id,
        role: data.role,
    }
    return await db.storeOrganizationMember(organizationMember);
}

async function removeOrganizationMember(id: string) {
    const organizationMember = await db.getOrganizationMember(id);
    await db.removeOrganizationMember(id);
    return organizationMember;
}

async function getOrganizationMemberByOrganizationId(organizationMemberId: string) {
    return await db.getOrganizationMembers(organizationMemberId);
}

async function getOrganizationMemberById(id: string) {
    return await db.getOrganizationMember(id);
}

export {
    createOrganizationMember,
    removeOrganizationMember,
    getOrganizationMemberByOrganizationId,
    getOrganizationMemberById,
}