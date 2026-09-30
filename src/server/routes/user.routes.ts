import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import deleteAccount from './user/DeleteAccount';
import exportUserData from './user/ExportData';
import getUsers from './user/GetUsers';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error message
 */
router.get('/users', verifyToken, getUsers);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account deleted successfully (no content)
 *       401:
 *         description: Unauthorized (user not authenticated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not authenticated
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error message
 */
router.delete('/users/me', verifyToken, deleteAccount);

/**
 * @swagger
 * /users/me/export:
 *   get:
 *     summary: Export all data associated with the authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data exported successfully as a JSON file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The exported user profile information
 *                 organizations:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of organizations associated with the user
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of tasks associated with the user
 *                 exportedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-30T15:51:00Z"
 *       401:
 *         description: Unauthorized (user not authenticated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to export user data
 */
router.get('/users/me/export', verifyToken, exportUserData);

export default router;
