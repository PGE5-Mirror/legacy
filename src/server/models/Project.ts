export interface Project {
  id: string;
  name: string;
  organization_id: string;
  createdAt: string;
}

export interface NewProject {
  name: string;
  organization_id: string;
}

export interface ProjectUpdate {
  name?: string;
}
