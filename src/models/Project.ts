export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface NewProject {
  name: string;
}

export interface ProjectUpdate {
  name?: string;
}
