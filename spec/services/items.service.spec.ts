import * as db from '../../src/server/persistence';
import { createItem, removeItem, getItemsByUserId, getItemById, updateItem } from '../../src/server/services/items.service';

jest.mock('../../src/server/persistence', () => ({
  storeItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  getItemsByUserId: jest.fn(),
  updateItem: jest.fn(),
}));

describe('itemsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should pass the new task through to the persistence layer', async () => {
      const itemData = { name: 'Test Item', user_id: 'user-123' };
      const createdItem = {
        id: 'uuid-123',
        name: 'Test Item',
        completed: false,
        user_id: 'user-123',
        column_id: null,
        assigned_to: null,
        position: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      (db.storeItem as jest.Mock).mockResolvedValue(createdItem);

      const result = await createItem(itemData);

      expect(db.storeItem).toHaveBeenCalledWith(itemData);
      expect(result).toEqual(createdItem);
    });
  });

  describe('removeItem', () => {
    it('should retrieve and remove an item by id', async () => {
      const mockItem = { id: 'item-123', name: 'Test Item' };

      (db.getItem as jest.Mock).mockResolvedValue(mockItem);
      (db.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await removeItem('item-123');

      expect(db.getItem).toHaveBeenCalledWith('item-123');
      expect(db.removeItem).toHaveBeenCalledWith('item-123');
      expect(result).toEqual(mockItem);
    });
  });

  describe('getItemsByUserId', () => {
    it('should return all items for a specific user', async () => {
      const mockItems = [{ id: 'item-123', name: 'Test Item', userId: 'user-123' }];

      (db.getItemsByUserId as jest.Mock).mockResolvedValue(mockItems);

      const result = await getItemsByUserId('user-123');

      expect(db.getItemsByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockItems);
    });
  });

  describe('getItemById', () => {
    it('should return an item by its id', async () => {
      const mockItem = { id: 'item-123', name: 'Test Item' };

      (db.getItem as jest.Mock).mockResolvedValue(mockItem);

      const result = await getItemById('item-123');

      expect(db.getItem).toHaveBeenCalledWith('item-123');
      expect(result).toEqual(mockItem);
    });
  });

  describe('updateItem', () => {
    it('should pass the id and update through to the persistence layer', async () => {
      const updateData = { name: 'Updated Name', completed: true };
      const updatedItem = { id: 'item-123', name: 'Updated Name', completed: true };

      (db.updateItem as jest.Mock).mockResolvedValue(updatedItem);

      const result = await updateItem('item-123', updateData);

      expect(db.updateItem).toHaveBeenCalledWith('item-123', updateData);
      expect(result).toEqual(updatedItem);
    });
  });
});