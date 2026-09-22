import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../services/auth.service';

export default async function login(req: Request, res: Response): Promise<Response | void> {
    try {
        const { email, password } = req.body;

        if (!email || email.trim().length < 1 || !password || password.trim().length < 1) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (err) {
        return res.status(500).json(err);
    }
};
