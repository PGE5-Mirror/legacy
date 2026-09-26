export interface Column {
  id: string;
  name: string;
  position: number;
  project_id: string;
  createdAt: string;
}

export interface NewColumn {
  name: string;
  project_id: string;
}

export interface ColumnUpdate {
  name?: string;
  position?: number;
}
