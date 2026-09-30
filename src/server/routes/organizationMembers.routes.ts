import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import getOrganizationMembersController from './organizationMembers/getOrganizationMembers';
import addOrganizationMemberController from './organizationMembers/addOrganizationMember';
import deleteOrganizationMemberController from './organizationMembers/deleteOrganizationMember';

const router = Router();

/**
 * @swagger
 * /organizations/{id}/members:
 *   get:
 *     summary: Get organization members by organization ID
 *     tags:
 *       - Organization Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the organization
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: List of organization members retrieved successfully
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
 *                   organization_id:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   user_id:
 *                     type: string
 *                     example: "987e6543-e21b-12d3-a456-426614174000"
 *                   role:
 *                     type: string
 *                     example: member
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-09-30T15:10:00Z"
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
router.get('/organizations/:id/members', verifyToken, getOrganizationMembersController);

/**
 * @swagger
 * /organizations/{id}/members:
 *   post:
 *     summary: Add a member to an organization
 *     tags:
 *       - Organization Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the organization
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - added_user_id
 *             properties:
 *               added_user_id:
 *                 type: string
 *                 example: "987e6543-e21b-12d3-a456-426614174000"
 *               role:
 *                 type: string
 *                 example: member
 *     responses:
 *       201:
 *         description: Organization member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 organization_id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 user_id:
 *                   type: string
 *                   example: "987e6543-e21b-12d3-a456-426614174000"
 *                 role:
 *                   type: string
 *                   example: member
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-09-30T15:10:00Z"
 *       400:
 *         description: Missing user_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing user_id
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
router.post('/organizations/:id/members', verifyToken, addOrganizationMemberController);

/**
 * @swagger
 * /organizations/members/{memberId}:
 *   delete:
 *     summary: Delete an organization member by ID
 *     tags:
 *       - Organization Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the organization member
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Organization member deleted successfully (no content)
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member not found
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
router.delete(
  '/organizations/:id/members/:memberId',
  verifyToken,
  deleteOrganizationMemberController,
);

export default router;
