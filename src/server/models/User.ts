export interface User {
  id: string;
  email: string;
  createdAt?: Date;
  tos_accepted_at?: Date;
  tos_version?: string;
  password: string;
}

export type UserExport = Omit<User, 'password'>;
