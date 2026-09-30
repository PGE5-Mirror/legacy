import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getUserSettingsController from './userSettings/getUserSettings';
import updateUserSettingsController from './userSettings/updateUserSettings';

const router = Router();

/**
 * @swagger
 * /users/me/settings:
 *   get:
 *     summary: Get user settings for the authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - user_id
 *                 - high_contrast
 *                 - font_size
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 high_contrast:
 *                   type: boolean
 *                   example: false
 *                 font_size:
 *                   type: string
 *                   example: "medium"
 *                 updatedAt:
 *                   type: string
 *                   example: "2026-09-30T15:10:00Z"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
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
router.get('/users/me/settings', verifyToken, getUserSettingsController);

/**
 * @swagger
 * /users/me/settings:
 *   put:
 *     summary: Update user settings for the authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               high_contrast:
 *                 type: boolean
 *                 example: false
 *               font_size:
 *                 type: string
 *                 enum: [small, medium, large]
 *                 example: medium
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - user_id
 *                 - high_contrast
 *                 - font_size
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 high_contrast:
 *                   type: boolean
 *                   example: false
 *                 font_size:
 *                   type: string
 *                   example: "medium"
 *                 updatedAt:
 *                   type: string
 *                   example: "2026-09-30T15:10:00Z"
 *       400:
 *         description: Invalid request body parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: high_contrast must be a boolean
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
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
router.put('/users/me/settings', verifyToken, updateUserSettingsController);

export default router;
