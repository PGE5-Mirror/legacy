import * as columnsService from '../../src/server/services/columns.service';
import * as db from '../../src/server/persistence';

jest.mock('uuid', () => ({
  v4: () => 'column-uuid-123',
}));

jest.mock('../../src/server/persistence', () => ({
  storeColumn: jest.fn(),
  getColumn: jest.fn(),
  removeColumn: jest.fn(),
  getColumns: jest.fn(),
  updateColumn: jest.fn(),
}));

describe('columns.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createColumn', () => {
    it('should create and store a column successfully', async () => {
      const columnData = { project_id: 'proj-1', name: 'To Do' };
      const storedColumn = { id: 'column-uuid-123', project_id: 'proj-1', name: 'To Do' };

      (db.storeColumn as jest.Mock).mockResolvedValue(storedColumn);

      const result = await columnsService.createColumn(columnData);

      expect(db.storeColumn).toHaveBeenCalledWith({
        id: 'column-uuid-123',
        project_id: 'proj-1',
        name: 'To Do',
      });
      expect(result).toEqual(storedColumn);
    });
  });

  describe('removeColumn', () => {
    it('should fetch and remove a column by id', async () => {
      const mockColumn = { id: 'column-uuid-123', name: 'To Do' };

      (db.getColumn as jest.Mock).mockResolvedValue(mockColumn);
      (db.removeColumn as jest.Mock).mockResolvedValue(undefined);

      const result = await columnsService.removeColumn('column-uuid-123');

      expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
      expect(db.removeColumn).toHaveBeenCalledWith('column-uuid-123');
      expect(result).toEqual(mockColumn);
    });
  });

  describe('getColumnById', () => {
    it('should retrieve a column by id', async () => {
      const mockColumn = { id: 'column-uuid-123', name: 'To Do' };

      (db.getColumn as jest.Mock).mockResolvedValue(mockColumn);

      const result = await columnsService.getColumnById('column-uuid-123');

      expect(db.getColumn).toHaveBeenCalledWith('column-uuid-123');
      expect(result).toEqual(mockColumn);
    });
  });

  describe('getColumnsByProjectId', () => {
    it('should retrieve columns by project id', async () => {
      const mockColumns = [{ id: 'column-uuid-123', name: 'To Do' }];

      (db.getColumns as jest.Mock).mockResolvedValue(mockColumns);

      const result = await columnsService.getColumnsByProjectId('proj-1');

      expect(db.getColumns).toHaveBeenCalledWith('proj-1');
      expect(result).toEqual(mockColumns);
    });
  });

  describe('updateColumn', () => {
    it('should update a column successfully', async () => {
      const updateData = { name: 'In Progress' };
      const updatedColumn = { id: 'column-uuid-123', name: 'In Progress' };

      (db.updateColumn as jest.Mock).mockResolvedValue(updatedColumn);

      const result = await columnsService.updateColumn('column-uuid-123', updateData);

      expect(db.updateColumn).toHaveBeenCalledWith('column-uuid-123', updateData);
      expect(result).toEqual(updatedColumn);
    });
  });
});