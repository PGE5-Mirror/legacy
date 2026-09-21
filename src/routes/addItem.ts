import { Request, Response } from 'express';
import * as taskService from '../services/TaskService';

export default async (req: Request, res: Response): Promise<void> => {
    try {
        const taskName = req.body.name;
        
        // La validation des entrées (vérifier si taskName est vide) devra être ajoutée ici
        
        const newTask = await taskService.createTask(taskName);
        res.status(201).json(newTask); // Code 201 pour une création réussie
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};