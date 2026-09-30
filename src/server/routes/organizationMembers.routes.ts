import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getOrganizationMembersController from './organizationMembers/getOrganizationMembers';
import addOrganizationMemberController from './organizationMembers/addOrganizationMember';
import deleteOrganizationMemberController from './organizationMembers/deleteOrganizationMember';

const router = Router();

router.get('/organizations/:id/members', verifyToken, getOrganizationMembersController);
router.post('/organizations/:id/members', verifyToken, addOrganizationMemberController);
router.delete(
  '/organizations/:id/members/:memberId',
  verifyToken,
  deleteOrganizationMemberController,
);

export default router;
