import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

interface ItemData {
  id?: string;
  name: string;
  completed?: boolean;
  userId?: string;
  createdAt?: Date;
}

async function createItem(data: ItemData) {
  const item = {
    id: uuid(),
    name: data.name,
    completed: false,
    userId: data.userId,
    createdAt: new Date(),
  };
  await db.storeItem(item);
  return item;
}

async function removeItem(id: string) {
  const item = db.getItem(id);
  await db.removeItem(id);
  return item;
}

async function getItemsByUserId(userId: string) {
  const items = await db.getItemsByUserId(userId);
  return items;
}

async function getItemById(id: string) {
  const item = await db.getItem(id);
  return item;
}

async function updateItem(data: ItemData) {
  if (!data.id) {
    throw new Error('Missing id for update');
  }

  await db.updateItem(data.id, {
    name: data.name,
    completed: data.completed,
  });

  const item = await db.getItem(data.id);
  return item;
}

export { createItem, removeItem, getItemsByUserId, getItemById, updateItem };
