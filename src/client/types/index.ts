export interface Item {
  id: string;
  name: string;
  completed: boolean;
  user_id: string;
  column_id: string | null;
  assigned_to: string | null;
  position: number;
  createdAt: string;
}

export type ItemCallback = (item: Item) => void;

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  organization_id?: string;
  createdAt: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  project_id: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface UserSettings {
  user_id: string;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large';
  updatedAt?: string;
}
