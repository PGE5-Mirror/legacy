import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getProjectsController from './projects/getProjects';
import addProjectController from './projects/addProject';
import updateProjectController from './projects/updateProject';
import deleteProjectController from './projects/deleteProject';

const router = Router();

router.put('/projects/:id', verifyToken, updateProjectController);
router.delete('/projects/:id', verifyToken, deleteProjectController);
router.get('/organizations/:id/projects', verifyToken, getProjectsController);
router.post('/organizations/:id/projects', verifyToken, addProjectController);

export default router;
