import request from 'supertest';
import express from 'express';
import router from '../../src/server/routes/columns.routes';
import * as authMiddleware from '../../src/server/middlewares/auth.middleware';
import * as columnsService from '../../src/server/services/columns.service';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../src/server/middlewares/auth.middleware', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'user-uuid-123', email: 'test@example.com' };
    next();
  }),
}));

jest.mock('../../src/server/services/columns.service', () => ({
  getColumnsByProjectId: jest.fn(),
  createColumn: jest.fn(),
  updateColumn: jest.fn(),
  getColumnById: jest.fn(),
  removeColumn: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe('columns.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /columns should call getColumnsController and return 200', async () => {
    const mockColumns = [{ id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' }];
    (columnsService.getColumnsByProjectId as jest.Mock).mockResolvedValue(mockColumns);

    const response = await request(app).get('/columns?project_id=project-uuid-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockColumns);
  });

  it('POST /columns should call addColumnController and return 201', async () => {
    const mockColumn = { id: 'col-1', name: 'To Do', project_id: 'project-uuid-123' };
    (columnsService.createColumn as jest.Mock).mockResolvedValue(mockColumn);

    const response = await request(app)
      .post('/columns')
      .send({ name: 'To Do', project_id: 'project-uuid-123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockColumn);
  });

  it('PUT /columns/:id should call updateColumnController and return 200', async () => {
    const existingColumn = { id: 'column-uuid-123', name: 'To Do', position: 0 };
    const updatedColumn = { id: 'column-uuid-123', name: 'In Progress', position: 1 };

    (columnsService.getColumnById as jest.Mock)
      .mockResolvedValueOnce(existingColumn)
      .mockResolvedValueOnce(updatedColumn);
    (columnsService.updateColumn as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .put('/columns/column-uuid-123')
      .send({ name: 'In Progress', position: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedColumn);
  });

  it('DELETE /columns/:id should call deleteColumnController and return 204', async () => {
    const mockColumn = { id: 'column-uuid-123', name: 'To Do' };
    (columnsService.getColumnById as jest.Mock).mockResolvedValue(mockColumn);
    (columnsService.removeColumn as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete('/columns/column-uuid-123');

    expect(response.status).toBe(204);
  });
});