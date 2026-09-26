export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface NewOrganizationMember {
  organization_id: string;
  user_id: string;
  role?: 'admin' | 'member';
}

export interface OrganizationMemberUpdate {
  role?: 'admin' | 'member';
}
