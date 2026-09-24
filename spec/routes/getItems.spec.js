const db = require('../../src/persistence');
const getItems = require('../../src/routes/getItems');
const ITEMS = [{ id: 12345 }];

jest.mock('../../src/persistence', () => ({
    getItems: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('it gets items correctly', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.resolve(ITEMS));

    await getItems(req, res);

    expect(db.getItems.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEMS);
});

test('it returns an empty array when there are no items', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.resolve([]));

    await getItems(req, res);

    expect(res.send.mock.calls[0][0]).toEqual([]);
});

test('it handles a large number of items', async () => {
    const req = {};
    const res = { send: jest.fn() };
    const manyItems = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    db.getItems.mockReturnValue(Promise.resolve(manyItems));

    await getItems(req, res);

    expect(res.send.mock.calls[0][0]).toHaveLength(1000);
});

test('it propagates an error when the persistence layer fails', async () => {
    const req = {};
    const res = { send: jest.fn() };
    db.getItems.mockReturnValue(Promise.reject(new Error('read failure')));

    await expect(getItems(req, res)).rejects.toThrow('read failure');
    expect(res.send).not.toHaveBeenCalled();
});
