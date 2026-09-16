const db = require('../../src/persistence');
const updateItem = require('../../src/routes/updateItem');
const ITEM = { id: 12345 };

jest.mock('../../src/persistence', () => ({
    getItem: jest.fn(),
    updateItem: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('it updates items correctly', async () => {
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: false },
    };
    const res = { send: jest.fn() };

    db.getItem.mockReturnValue(Promise.resolve(ITEM));

    await updateItem(req, res);

    expect(db.updateItem.mock.calls.length).toBe(1);
    expect(db.updateItem.mock.calls[0][0]).toBe(req.params.id);
    expect(db.updateItem.mock.calls[0][1]).toEqual({
        name: 'New title',
        completed: false,
    });

    expect(db.getItem.mock.calls.length).toBe(1);
    expect(db.getItem.mock.calls[0][0]).toBe(req.params.id);

    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEM);
});

// TODO: input checking must be implement
// test('it returns 404 and does not call updateItem when the item does not exist', async () => {
//     const req = {
//         params: { id: 'unknown-id' },
//         body: { name: 'New title', completed: true },
//     };
//     const res = { send: jest.fn(), sendStatus: jest.fn() };

//     db.getItem.mockReturnValue(Promise.resolve(undefined));

//     await updateItem(req, res);

//     expect(db.updateItem).not.toHaveBeenCalled();
//     expect(res.sendStatus).toHaveBeenCalledWith(404);
// });

// TODO: input checking must be implement
// test('it defaults completed to false when not provided in the body', async () => {
//     const req = {
//         params: { id: 1234 },
//         body: { name: 'New title' },
//     };
//     const res = { send: jest.fn() };

//     db.getItem.mockReturnValue(Promise.resolve(ITEM));

//     await updateItem(req, res);

//     expect(db.updateItem.mock.calls[0][1].completed).toBe(false);
// });

test('it toggles completed to true when explicitly requested', async () => {
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: true },
    };
    const res = { send: jest.fn() };

    db.getItem.mockReturnValue(Promise.resolve(ITEM));

    await updateItem(req, res);

    expect(db.updateItem.mock.calls[0][1].completed).toBe(true);
});

test('it propagates an error when the persistence layer fails to update', async () => {
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: false },
    };
    const res = { send: jest.fn() };

    db.getItem.mockReturnValue(Promise.resolve(ITEM));
    db.updateItem.mockImplementation(() => {
        throw new Error('update failure');
    });

    await expect(updateItem(req, res)).rejects.toThrow('update failure');
});
