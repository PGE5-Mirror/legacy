import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getColumnsController from './columns/getColumns';
import addColumnController from './columns/addColumn';
import updateColumnController from './columns/updateColumn';
import deleteColumnController from './columns/deleteColumn';

const router = Router();

/**
 * @swagger
 * /columns:
 *   get:
 *     summary: Get columns by project ID
 *     tags:
 *       - Columns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project_id
 *         required: false
 *         schema:
 *           type: string
 *         description: The unique identifier of the project to filter columns by
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: List of columns retrieved successfully
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
 *                   name:
 *                     type: string
 *                     example: To Do
 *                   project_id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-09-30T15:10:00Z"
 *                   position:
 *                     type: number
 *                     example: 1
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
router.get('/columns', verifyToken, getColumnsController);

/**
 * @swagger
 * /columns:
 *   post:
 *     summary: Create a new column
 *     tags:
 *       - Columns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - project_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: To Do
 *               project_id:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Column created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: To Do
 *                 project_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-30T15:10:00Z"
 *                 position:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Missing name or project_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing name
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
router.post('/columns', verifyToken, addColumnController);

/**
 * @swagger
 * /columns/{id}:
 *   put:
 *     summary: Update a column by ID
 *     tags:
 *       - Columns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the column
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: In Progress
 *               position:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Column updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: In Progress
 *                 position:
 *                   type: integer
 *                   example: 1
 *                 project_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
 *       404:
 *         description: Column not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Column with id 123e4567-e89b-12d3-a456-426614174000 not found
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
router.put('/columns/:id', verifyToken, updateColumnController);

/**
 * @swagger
 * /columns/{id}:
 *   delete:
 *     summary: Delete a column by ID
 *     tags:
 *       - Columns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the column
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Column deleted successfully (no content)
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
 *       404:
 *         description: Column not found or missing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing id
 *                 message:
 *                   type: string
 *                   example: Column not found
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
router.delete('/columns/:id', verifyToken, deleteColumnController);

export default router;
