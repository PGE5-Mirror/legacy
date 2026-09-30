export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  user_id: string | null;
  column_id: string | null;
  assigned_to: string | null;
  position: number;
  priority: TaskPriority;
  deadline: string | null;
  createdAt: string;
}

export interface NewTask {
  name: string;
  user_id: string | null;
  column_id?: string | null;
  assigned_to?: string | null;
  position?: number;
  priority?: TaskPriority;
  deadline?: string | null;
}

export interface TaskUpdate {
  name?: string;
  completed?: boolean;
  column_id?: string | null;
  assigned_to?: string | null;
  position?: number;
  priority?: TaskPriority;
  deadline?: string | null;
}
