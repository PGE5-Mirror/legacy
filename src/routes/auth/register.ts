import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '../../services/auth.service';

export default async function register(req: Request, res: Response): Promise<Response | void> {
    try {
        const { email, password } = req.body;

        if (!email || email.trim().length < 1 || !password || password.trim().length < 1) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await createUser({ email: email, password: hashedPassword });

        return res.status(201).json({
            id: createdUser.id,
            email: createdUser.email,
            createdAt: createdUser.createdAt
        });
    } catch (err) {
        return res.status(500).json(err);
    }
};
