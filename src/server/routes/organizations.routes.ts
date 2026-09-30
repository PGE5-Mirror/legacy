import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getOrganizationsController from './organizations/getOrganizations';
import addOrganizationController from './organizations/addOrganization';
import updateOrganizationController from './organizations/updateOrganization';
import deleteOrganizationController from './organizations/deleteOrganization';

const router = Router();

router.get('/organizations', verifyToken, getOrganizationsController);
router.post('/organizations', verifyToken, addOrganizationController);
router.put('/organizations/:id', verifyToken, updateOrganizationController);
router.delete('/organizations/:id', verifyToken, deleteOrganizationController);

export default router;
