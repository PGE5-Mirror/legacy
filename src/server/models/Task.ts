export interface Task {
  id: string;
  name: string;
  completed: boolean;
  user_id: string;
  column_id: string | null;
  assigned_to: string | null;
  position: number;
  createdAt: string;
}

export interface NewTask {
  name: string;
  user_id: string;
  column_id?: string | null;
  assigned_to?: string | null;
  position?: number;
}

export interface TaskUpdate {
  name?: string;
  completed?: boolean;
  column_id?: string | null;
  assigned_to?: string | null;
  position?: number;
}