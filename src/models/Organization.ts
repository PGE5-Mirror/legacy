export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface NewOrganization {
  name: string;
}

export interface OrganizationUpdate {
  name?: string;
}
