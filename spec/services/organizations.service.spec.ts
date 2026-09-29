import * as organizationService from '../../src/server/services/organization.service';
import * as db from '../../src/server/persistence';

jest.mock('uuid', () => ({
  v4: () => 'org-uuid-123',
}));

jest.mock('../../src/server/persistence', () => ({
  storeOrganization: jest.fn(),
  getOrganization: jest.fn(),
  removeOrganization: jest.fn(),
  getOrganizations: jest.fn(),
  updateOrganization: jest.fn(),
}));

describe('organization.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('should create and store an organization successfully', async () => {
      const orgData = { name: 'Org 1' };
      const storedOrg = { id: 'org-uuid-123', name: 'Org 1', createdAt: new Date() };

      (db.storeOrganization as jest.Mock).mockResolvedValue(storedOrg);

      const result = await organizationService.createOrganization(orgData);

      expect(db.storeOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'org-uuid-123',
          name: 'Org 1',
        })
      );
      expect(result).toEqual(storedOrg);
    });
  });

  describe('removeOrganization', () => {
    it('should fetch and remove an organization by id', async () => {
      const mockOrg = { id: 'org-uuid-123', name: 'Org 1' };

      (db.getOrganization as jest.Mock).mockResolvedValue(mockOrg);
      (db.removeOrganization as jest.Mock).mockResolvedValue(undefined);

      const result = await organizationService.removeOrganization('org-uuid-123');

      expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
      expect(db.removeOrganization).toHaveBeenCalledWith('org-uuid-123');
      expect(result).toEqual(mockOrg);
    });
  });

  describe('getOrganizationById', () => {
    it('should retrieve an organization by id', async () => {
      const mockOrg = { id: 'org-uuid-123', name: 'Org 1' };

      (db.getOrganization as jest.Mock).mockResolvedValue(mockOrg);

      const result = await organizationService.getOrganizationById('org-uuid-123');

      expect(db.getOrganization).toHaveBeenCalledWith('org-uuid-123');
      expect(result).toEqual(mockOrg);
    });
  });

  describe('getOrganizations', () => {
    it('should retrieve all organizations', async () => {
      const mockOrgs = [{ id: 'org-uuid-123', name: 'Org 1' }];

      (db.getOrganizations as jest.Mock).mockResolvedValue(mockOrgs);

      const result = await organizationService.getOrganizations();

      expect(db.getOrganizations).toHaveBeenCalled();
      expect(result).toEqual(mockOrgs);
    });
  });

  describe('updateOrganization', () => {
    it('should update an organization successfully', async () => {
      const updateData = { name: 'Updated Org' };
      const updatedOrg = { id: 'org-uuid-123', name: 'Updated Org' };

      (db.updateOrganization as jest.Mock).mockResolvedValue(updatedOrg);

      const result = await organizationService.updateOrganization('org-uuid-123', updateData);

      expect(db.updateOrganization).toHaveBeenCalledWith('org-uuid-123', updateData);
      expect(result).toEqual(updatedOrg);
    });
  });
});