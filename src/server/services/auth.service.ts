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
  const createdUser = await db.storeUser(user);
  return createdUser;
}

async function getUserByEmail(email: string) {
  const user = await db.getUser(email);
  return user;
}

export { getUserByEmail, createUser };
