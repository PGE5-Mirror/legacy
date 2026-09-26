import crypto from 'crypto';
import { Task } from '../models/Task';
import * as repository from '../persistence/mysql';

export async function createTask(name: string): Promise<Task> {
    const newTask: Task = {
        id: crypto.randomUUID(), // Remplacement de uuidv4() par l'API native de Node.js
        name: name,
        completed: false,
    };
    await repository.storeItem(newTask);
    return newTask;
}

export async function getAllTasks(): Promise<Task[]> {
    return await repository.getItems();
}

export async function removeTask(id: string): Promise<void> {
    await repository.removeItem(id);
}

export async function updateTask(id: string, data: { name: string; completed: boolean }): Promise<Task | undefined> {
    const taskData: Task = { id, name: data.name, completed: data.completed };
    await repository.updateItem(id, taskData);
    return await repository.getItem(id);
}