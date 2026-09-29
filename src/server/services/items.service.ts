import * as db from '../persistence';
import { NewTask, TaskUpdate } from '../models/Task';

async function createItem(data: NewTask) {
  return db.storeItem(data);
}

async function removeItem(id: string) {
  const item = await db.getItem(id);
  await db.removeItem(id);
  return item;
}

async function getItemsByUserId(userId: string) {
  return db.getItemsByUserId(userId);
}

async function getItemsByColumnId(columnId: string) {
  return db.getItemsByColumnId(columnId);
}

async function getItemById(id: string) {
  return db.getItem(id);
}

async function updateItem(id: string, data: TaskUpdate) {
  return db.updateItem(id, data);
}

export { createItem, removeItem, getItemsByUserId, getItemsByColumnId, getItemById, updateItem };
