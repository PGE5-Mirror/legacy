import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getItemsController from './items/getItems';
import addItemController from './items/addItem';
import updateItemController from './items/updateItem';
import deleteItemController from './items/deleteItem';
import getItemsByColumnController from './items/getItemsByColumn';

const router = Router();

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items (tasks) for the authenticated user
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items retrieved successfully
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
 *                     example: Implement new login feature
 *                   user_id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   column_id:
 *                     type: string
 *                     nullable: true
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   assigned_to:
 *                     type: string
 *                     nullable: true
 *                     example: "987e6543-e21b-12d3-a456-426614174000"
 *                   position:
 *                     type: integer
 *                     example: 0
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-09-30T15:10:00Z"
 *                   completed:
 *                     type: boolean
 *                     example: false
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
router.get('/items', verifyToken, getItemsController);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item (task)
 *     tags:
 *       - Items
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Implement new login feature
 *               column_id:
 *                 type: string
 *                 nullable: true
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               assigned_to:
 *                 type: string
 *                 nullable: true
 *                 example: "987e6543-e21b-12d3-a456-426614174000"
 *               position:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *     responses:
 *       201:
 *         description: Item created successfully
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
 *                   example: Implement new login feature
 *                 user_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 column_id:
 *                   type: string
 *                   nullable: true
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 assigned_to:
 *                   type: string
 *                   nullable: true
 *                   example: "987e6543-e21b-12d3-a456-426614174000"
 *                 position:
 *                   type: integer
 *                   example: 0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-30T15:10:00Z"
 *                 completed:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Missing title or invalid position format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing title
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
router.post('/items', verifyToken, addItemController);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item (task) by ID
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the item
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
 *                 example: Updated task name
 *               completed:
 *                 type: boolean
 *                 example: true
 *               column_id:
 *                 type: string
 *                 nullable: true
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               assigned_to:
 *                 type: string
 *                 nullable: true
 *                 example: "987e6543-e21b-12d3-a456-426614174000"
 *               position:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       200:
 *         description: Item updated successfully
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
 *                   example: Updated task name
 *                 completed:
 *                   type: boolean
 *                   example: true
 *                 user_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 column_id:
 *                   type: string
 *                   nullable: true
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 assigned_to:
 *                   type: string
 *                   nullable: true
 *                   example: "987e6543-e21b-12d3-a456-426614174000"
 *                 position:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-30T15:10:00Z"
 *       400:
 *         description: Invalid input (empty name or negative position)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Task name cannot be empty
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
 *       403:
 *         description: Forbidden (user does not own the item)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item with id 123e4567-e89b-12d3-a456-426614174000 not found
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
router.put('/items/:id', verifyToken, updateItemController);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item (task) by ID
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the item
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Item deleted successfully (no content)
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
 *       403:
 *         description: Forbidden (user does not own the item)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Item not found or missing ID
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
 *                   example: Task not found
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
router.delete('/items/:id', verifyToken, deleteItemController);

/**
 * @swagger
 * /columns/{id}/tasks:
 *   get:
 *     summary: Get all items (tasks) by column ID
 *     tags:
 *       - Items
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
 *       200:
 *         description: List of items retrieved successfully
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
 *                     example: Implement new login feature
 *                   user_id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   column_id:
 *                     type: string
 *                     nullable: true
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   assigned_to:
 *                     type: string
 *                     nullable: true
 *                     example: "987e6543-e21b-12d3-a456-426614174000"
 *                   position:
 *                     type: integer
 *                     example: 0
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-09-30T15:10:00Z"
 *                   completed:
 *                     type: boolean
 *                     example: false
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
router.get('/columns/:id/tasks', verifyToken, getItemsByColumnController);

export default router;
