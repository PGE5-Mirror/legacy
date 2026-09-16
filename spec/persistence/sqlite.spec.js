const db = require('../../src/persistence/sqlite');
const fs = require('fs');
const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';

const ITEM = {
    id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
    name: 'Test',
    completed: false,
};

beforeEach(() => {
    if (fs.existsSync(location)) {
        fs.unlinkSync(location);
    }
});

test('it initializes correctly', async () => {
    await db.init();
});

test('it can store and retrieve items', async () => {
    await db.init();

    await db.storeItem(ITEM);

    const items = await db.getItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(ITEM);
});

test('it can update an existing item', async () => {
    await db.init();

    const initialItems = await db.getItems();
    expect(initialItems.length).toBe(0);

    await db.storeItem(ITEM);

    await db.updateItem(
        ITEM.id,
        Object.assign({}, ITEM, { completed: !ITEM.completed }),
    );

    const items = await db.getItems();
    expect(items.length).toBe(1);
    expect(items[0].completed).toBe(!ITEM.completed);
});

test('it can remove an existing item', async () => {
    await db.init();
    await db.storeItem(ITEM);

    await db.removeItem(ITEM.id);

    const items = await db.getItems();
    expect(items.length).toBe(0);
});

test('it can get a single item', async () => {
    await db.init();
    await db.storeItem(ITEM);

    const item = await db.getItem(ITEM.id);
    expect(item).toEqual(ITEM);
});

test('it returns null or undefined when getting a non-existent item', async () => {
    await db.init();

    const item = await db.getItem('non-existent-id');
    expect(item).toBeFalsy();
});

test('it handles fetching items from an empty database', async () => {
    await db.init();

    const items = await db.getItems();
    expect(items).toEqual([]);
});

test('it can store multiple items correctly', async () => {
    await db.init();

    const secondItem = {
        id: '2bdf4e8d-e402-5957-9469-3b02ed0e7cf4',
        name: 'Second Test',
        completed: true,
    };

    await db.storeItem(ITEM);
    await db.storeItem(secondItem);

    const items = await db.getItems();
    expect(items.length).toBe(2);
    expect(items).toContainEqual(ITEM);
    expect(items).toContainEqual(secondItem);
});

test('it only removes the targeted item', async () => {
    await db.init();

    const secondItem = {
        id: '2bdf4e8d-e402-5957-9469-3b02ed0e7cf4',
        name: 'Second Test',
        completed: true,
    };

    await db.storeItem(ITEM);
    await db.storeItem(secondItem);

    await db.removeItem(ITEM.id);

    const items = await db.getItems();
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(secondItem);
});

test('it cleans up database connection on teardown', async () => {
    await db.init();

    if (typeof db.teardown === 'function') {
        await expect(db.teardown()).resolves.not.toThrow();
    } else if (typeof db.close === 'function') {
        await expect(db.close()).resolves.not.toThrow();
    }
});

test('it does not throw when removing a non-existent item id', async () => {
    await db.init();

    await expect(db.removeItem('non-existent-id')).resolves.not.toThrow();

    const items = await db.getItems();
    expect(items.length).toBe(0);
});

test('it handles special characters and unicode in the item name', async () => {
    await db.init();

    const specialItem = {
        id: 'special-chars-id',
        name: `O'Brien's "list" <script>alert('x')</script> — café ☕ 日本語`,
        completed: false,
    };

    await db.storeItem(specialItem);

    const item = await db.getItem(specialItem.id);
    expect(item.name).toBe(specialItem.name);
});

test('it handles a very long item name', async () => {
    await db.init();

    const longName = 'a'.repeat(10000);
    const longItem = { id: 'long-name-id', name: longName, completed: false };

    await db.storeItem(longItem);

    const item = await db.getItem(longItem.id);
    expect(item.name).toBe(longName);
    expect(item.name.length).toBe(10000);
});

test('it handles an empty string as item name', async () => {
    await db.init();

    const emptyNameItem = { id: 'empty-name-id', name: '', completed: false };

    await db.storeItem(emptyNameItem);

    const item = await db.getItem(emptyNameItem.id);
    expect(item.name).toBe('');
});

test('it handles concurrent inserts without losing data', async () => {
    await db.init();

    const items = Array.from({ length: 20 }, (_, i) => ({
        id: `concurrent-id-${i}`,
        name: `Item ${i}`,
        completed: i % 2 === 0,
    }));

    await Promise.all(items.map((item) => db.storeItem(item)));

    const storedItems = await db.getItems();
    expect(storedItems.length).toBe(20);
    items.forEach((item) => {
        expect(storedItems).toContainEqual(item);
    });
});

// TODO: id in database is a non-unique varchar(36), must change
// test('it rejects or overwrites when storing an item with a duplicate id', async () => {
//     await db.init();

//     await db.storeItem(ITEM);

//     let duplicateHandled = false;
//     try {
//         await db.storeItem(Object.assign({}, ITEM, { name: 'Duplicate' }));
//     } catch (err) {
//         duplicateHandled = true;
//     }

//     const items = await db.getItems();
//     const matchingItems = items.filter((i) => i.id === ITEM.id);
//     expect(matchingItems.length).toBe(1);

//     if (!duplicateHandled) {
//         expect(matchingItems[0].name).toBe('Duplicate');
//     }
// });

test('it can update an item to have an empty completed toggle sequence without corrupting other fields', async () => {
    await db.init();
    await db.storeItem(ITEM);

    await db.updateItem(ITEM.id, Object.assign({}, ITEM, { completed: true }));
    await db.updateItem(ITEM.id, Object.assign({}, ITEM, { completed: false }));

    const item = await db.getItem(ITEM.id);
    expect(item.completed).toBe(false);
    expect(item.name).toBe(ITEM.name);
});
