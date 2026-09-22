import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

interface ItemData {
    id?: string;
    name: string;
    completed?: boolean;
    createdAt?: Date;
}

async function createItem(data: ItemData) {
    const item = {
        id: uuid(),
        name: data.name,
        completed: false,
        createdAt: new Date(),
    };
    await db.storeItem(item);
    return item;
}

async function removeItem(id: string) {
    await db.removeItem(id);
}

async function getItems() {
    const items = await db.getItems();
    return items;
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

export {
    createItem,
    removeItem,
    getItems,
    updateItem,
};
