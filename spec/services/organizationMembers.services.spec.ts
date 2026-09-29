import * as organizationMembersService from '../../src/server/services/organizationMembers.service';
import * as db from '../../src/server/persistence';

jest.mock('uuid', () => ({
  v4: () => 'member-uuid-123',
}));

jest.mock('../../src/server/persistence', () => ({
  storeOrganizationMember: jest.fn(),
  getOrganizationMember: jest.fn(),
  removeOrganizationMember: jest.fn(),
  getOrganizationMembers: jest.fn(),
}));

describe('organizationMembers.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrganizationMember', () => {
    it('should create and store an organization member successfully', async () => {
      const memberData = { organization_id: 'org-1', user_id: 'user-1', role: 'member' as const };
      const storedMember = { id: 'member-uuid-123', organization_id: 'org-1', user_id: 'user-1', role: 'member' };

      (db.storeOrganizationMember as jest.Mock).mockResolvedValue(storedMember);

      const result = await organizationMembersService.createOrganizationMember(memberData);

      expect(db.storeOrganizationMember).toHaveBeenCalledWith({
        id: 'member-uuid-123',
        organization_id: 'org-1',
        user_id: 'user-1',
        role: 'member',
      });
      expect(result).toEqual(storedMember);
    });
  });

  describe('removeOrganizationMember', () => {
    it('should fetch and remove an organization member by id', async () => {
      const mockMember = { id: 'member-uuid-123', organization_id: 'org-1', user_id: 'user-1', role: 'member' };

      (db.getOrganizationMember as jest.Mock).mockResolvedValue(mockMember);
      (db.removeOrganizationMember as jest.Mock).mockResolvedValue(undefined);

      const result = await organizationMembersService.removeOrganizationMember('member-uuid-123');

      expect(db.getOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
      expect(db.removeOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
      expect(result).toEqual(mockMember);
    });
  });

  describe('getOrganizationMemberByOrganizationId', () => {
    it('should retrieve organization members by organization id', async () => {
      const mockMembers = [{ id: 'member-uuid-123', organization_id: 'org-1', user_id: 'user-1', role: 'member' }];

      (db.getOrganizationMembers as jest.Mock).mockResolvedValue(mockMembers);

      const result = await organizationMembersService.getOrganizationMemberByOrganizationId('org-1');

      expect(db.getOrganizationMembers).toHaveBeenCalledWith('org-1');
      expect(result).toEqual(mockMembers);
    });
  });

  describe('getOrganizationMemberById', () => {
    it('should retrieve an organization member by id', async () => {
      const mockMember = { id: 'member-uuid-123', organization_id: 'org-1', user_id: 'user-1', role: 'member' };

      (db.getOrganizationMember as jest.Mock).mockResolvedValue(mockMember);

      const result = await organizationMembersService.getOrganizationMemberById('member-uuid-123');

      expect(db.getOrganizationMember).toHaveBeenCalledWith('member-uuid-123');
      expect(result).toEqual(mockMember);
    });
  });
});