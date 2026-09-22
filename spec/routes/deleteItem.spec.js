const db = require('../../src/persistence');
const deleteItem = require('../../src/routes/deleteItem');

jest.mock('../../src/persistence', () => ({
    removeItem: jest.fn(),
    getItem: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('it removes item correctly', async () => {
    const req = { params: { id: 12345 } };
    const res = { sendStatus: jest.fn() };

    await deleteItem(req, res);

    expect(db.removeItem.mock.calls.length).toBe(1);
    expect(db.removeItem.mock.calls[0][0]).toBe(req.params.id);
    expect(res.sendStatus.mock.calls[0].length).toBe(1);
    expect(res.sendStatus.mock.calls[0][0]).toBe(200);
});

test('it returns 200 even when the id does not correspond to an existing item', async () => {
    const req = { params: { id: 'non-existent-id' } };
    const res = { sendStatus: jest.fn() };

    db.removeItem.mockResolvedValue(undefined);

    await deleteItem(req, res);

    expect(db.removeItem.mock.calls[0][0]).toBe('non-existent-id');
    expect(res.sendStatus.mock.calls[0][0]).toBe(200);
});

test('it handles a string id the same way as a numeric one', async () => {
    const req = { params: { id: '12345' } };
    const res = { sendStatus: jest.fn() };

    await deleteItem(req, res);

    expect(db.removeItem.mock.calls[0][0]).toBe('12345');
    expect(res.sendStatus).toHaveBeenCalledWith(200);
});

test('it propagates an error when the persistence layer fails to remove the item', async () => {
    const req = { params: { id: 12345 } };
    const res = { sendStatus: jest.fn() };

    db.removeItem.mockImplementation(() => {
        throw new Error('removal failure');
    });

    await expect(deleteItem(req, res)).rejects.toThrow('removal failure');
    expect(res.sendStatus).not.toHaveBeenCalled();
});
