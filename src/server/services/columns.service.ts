import { ColumnUpdate } from '../models/Column';
import * as db from '../persistence';
import { v4 as uuid } from 'uuid';

interface ColumnData {
    id?: string,
    project_id: string;
    name: string;
}

async function createColumn(data: ColumnData) {
    const column = {
        id: uuid(),
        project_id: data.project_id,
        name: data.name,
    }
    return await db.storeColumn(column);
}

async function removeColumn(id: string) {
    const column = await db.getColumn(id);
    await db.removeColumn(id);
    return column;
}

async function getColumnById(columnId: string) {
    return await db.getColumn(columnId);
}

async function getColumnsByProjectId(projectId: string) {
    return await db.getColumns(projectId);
}

async function updateColumn(id: string, data: ColumnUpdate) {
    return await db.updateColumn(id, data);
}

export {
    createColumn,
    removeColumn,
    getColumnById,
    getColumnsByProjectId,
    updateColumn,
}