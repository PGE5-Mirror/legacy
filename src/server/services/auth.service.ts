import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

interface UserData {
  id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

async function createUser(data: UserData) {
  const user = {
    id: uuid(),
    email: data.email,
    password: data.password,
  };
  return await db.storeUser(user);
}

async function getUserByEmail(email: string) {
  return await db.getUser(email);
}

export { getUserByEmail, createUser };
