import * as db from '../persistence';
import { NewTask, TaskUpdate } from '../models/Task';

async function createItem(data: NewTask) {
  return await db.storeItem(data);
}

async function removeItem(id: string) {
  const item = await db.getItem(id);
  await db.removeItem(id);
  return item;
}

async function getItemsByUserId(userId: string) {
  return await db.getItemsByUserId(userId);
}

async function getItemsByColumnId(columnId: string) {
  return await db.getItemsByColumnId(columnId);
}

async function getItemById(id: string) {
  return await db.getItem(id);
}

async function updateItem(id: string, data: TaskUpdate) {
  return await db.updateItem(id, data);
}

export { createItem, removeItem, getItemsByUserId, getItemsByColumnId, getItemById, updateItem };
