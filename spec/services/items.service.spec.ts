import * as db from '../../src/server/persistence';
import { v4 as uuid } from 'uuid';
import { createItem, removeItem, getItemsByUserId, getItemById, updateItem } from '../../src/server/services/items.service';

jest.mock('../../src/server/persistence', () => ({
  storeItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  getItemsByUserId: jest.fn(),
  updateItem: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('itemsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an item successfully with a generated uuid and default completed status', async () => {
      const itemData = { name: 'Test Item', userId: 'user-123' };
      const mockUuid = 'uuid-123';

      (uuid as jest.Mock).mockReturnValue(mockUuid);
      (db.storeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await createItem(itemData);

      expect(uuid).toHaveBeenCalledTimes(1);
      expect(db.storeItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUuid,
          name: 'Test Item',
          completed: false,
          userId: 'user-123',
          createdAt: expect.any(Date),
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUuid,
          name: 'Test Item',
          completed: false,
          userId: 'user-123',
        })
      );
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
    it('should update an item and return the updated version', async () => {
      const updateData = { id: 'item-123', name: 'Updated Name', completed: true };
      const updatedItem = { id: 'item-123', name: 'Updated Name', completed: true };

      (db.updateItem as jest.Mock).mockResolvedValue(undefined);
      (db.getItem as jest.Mock).mockResolvedValue(updatedItem);

      const result = await updateItem(updateData);

      expect(db.updateItem).toHaveBeenCalledWith('item-123', {
        name: 'Updated Name',
        completed: true,
      });
      expect(db.getItem).toHaveBeenCalledWith('item-123');
      expect(result).toEqual(updatedItem);
    });

    it('should throw an error if id is missing', async () => {
      const updateData = { name: 'Updated Name' };

      await expect(updateItem(updateData)).rejects.toThrow('Missing id for update');
      expect(db.updateItem).not.toHaveBeenCalled();
    });
  });
});