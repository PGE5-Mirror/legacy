export interface Task {
  id: string;
  name: string;
  completed: boolean;
  column_id: string | null;
  position: number;
  createdAt: string;
}

export interface NewTask {
  name: string;
}

export interface TaskUpdate {
  name?: string;
  completed?: boolean;
}
