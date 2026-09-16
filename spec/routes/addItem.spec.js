const db = require('../../src/persistence');
const addItem = require('../../src/routes/addItem');
const ITEM = { id: 12345 };
const {v4 : uuid} = require('uuid');

jest.mock('uuid', () => ({ v4: jest.fn() }));

jest.mock('../../src/persistence', () => ({
    removeItem: jest.fn(),
    storeItem: jest.fn(),
    getItem: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('it stores item correctly', async () => {
    const id = 'something-not-a-uuid';
    const name = 'A sample item';
    const req = { body: { name } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    const expectedItem = { id, name, completed: false };

    expect(db.storeItem.mock.calls.length).toBe(1);
    expect(db.storeItem.mock.calls[0][0]).toEqual(expectedItem);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(expectedItem);
});

test('it always generates a fresh id via uuid, even if the client supplies one', async () => {
    const id = 'server-generated-id';
    const req = { body: { id: 'client-supplied-id', name: 'Item' } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    expect(db.storeItem.mock.calls[0][0].id).toBe(id);
    expect(db.storeItem.mock.calls[0][0].id).not.toBe('client-supplied-id');
});

test('it always sets completed to false, even if the client sends completed: true', async () => {
    const id = 'some-id';
    const req = { body: { name: 'Item', completed: true } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    expect(db.storeItem.mock.calls[0][0].completed).toBe(false);
});

test('it handles a missing name in the request body', async () => {
    const id = 'some-id';
    const req = { body: {} };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    expect(db.storeItem.mock.calls[0][0]).toEqual({
        id,
        name: undefined,
        completed: false,
    });
});

test('it handles an empty string as name', async () => {
    const id = 'some-id';
    const req = { body: { name: '' } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    expect(db.storeItem.mock.calls[0][0].name).toBe('');
});

test('it propagates an error when the persistence layer fails to store the item', async () => {
    const id = 'some-id';
    const req = { body: { name: 'Item' } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);
    db.storeItem.mockImplementation(() => {
        throw new Error('storage failure');
    });

    await expect(addItem(req, res)).rejects.toThrow('storage failure');
    expect(res.send).not.toHaveBeenCalled();
});
