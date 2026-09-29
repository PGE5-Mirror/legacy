import * as projectsService from '../../src/server/services/projects.service';
import * as db from '../../src/server/persistence';

jest.mock('../../src/server/persistence', () => ({
  storeProject: jest.fn(),
  getProject: jest.fn(),
  removeProject: jest.fn(),
  getProjects: jest.fn(),
  updateProject: jest.fn(),
}));

describe('projects.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create and store a project successfully', async () => {
      const projectData = { name: 'Project 1', organization_id: 'org-1' };
      const storedProject = { id: 'proj-uuid-123', name: 'Project 1', organization_id: 'org-1' };

      (db.storeProject as jest.Mock).mockResolvedValue(storedProject);

      const result = await projectsService.createProject(projectData);

      expect(db.storeProject).toHaveBeenCalledWith({
        name: 'Project 1',
        organization_id: 'org-1',
      });
      expect(result).toEqual(storedProject);
    });
  });

  describe('removeProject', () => {
    it('should fetch and remove a project by id', async () => {
      const mockProject = { id: 'proj-uuid-123', name: 'Project 1', organization_id: 'org-1' };

      (db.getProject as jest.Mock).mockResolvedValue(mockProject);
      (db.removeProject as jest.Mock).mockResolvedValue(undefined);

      const result = await projectsService.removeProject('proj-uuid-123');

      expect(db.getProject).toHaveBeenCalledWith('proj-uuid-123');
      expect(db.removeProject).toHaveBeenCalledWith('proj-uuid-123');
      expect(result).toEqual(mockProject);
    });
  });

  describe('getProjectById', () => {
    it('should retrieve a project by id', async () => {
      const mockProject = { id: 'proj-uuid-123', name: 'Project 1', organization_id: 'org-1' };

      (db.getProject as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectsService.getProjectById('proj-uuid-123');

      expect(db.getProject).toHaveBeenCalledWith('proj-uuid-123');
      expect(result).toEqual(mockProject);
    });
  });

  describe('getProjects', () => {
    it('should retrieve projects by organization id', async () => {
      const mockProjects = [{ id: 'proj-uuid-123', name: 'Project 1', organization_id: 'org-1' }];

      (db.getProjects as jest.Mock).mockResolvedValue(mockProjects);

      const result = await projectsService.getProjects('org-1');

      expect(db.getProjects).toHaveBeenCalledWith('org-1');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const updateData = { name: 'Updated Project' };
      const updatedProject = { id: 'proj-uuid-123', name: 'Updated Project', organization_id: 'org-1' };

      (db.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectsService.updateProject('proj-uuid-123', updateData);

      expect(db.updateProject).toHaveBeenCalledWith('proj-uuid-123', updateData);
      expect(result).toEqual(updatedProject);
    });
  });
});