const db = require('../persistence');
const { v4: uuid } = require('uuid');

async function createItem(data) {
    const item = {
        id: uuid(),
        name: data.name,
        completed: false,
    };
    await db.storeItem(item);
    return item;
}

module.exports = {
    createItem,
};
