const db = require('../persistence');
const {v4 : uuid} = require('uuid');
const { publishEvent } = require('../events/rabbitmq');

module.exports = async (req, res) => {
    try {
        const {name} = req.body;

        if (!name || name.trim().length < 1) {
            return res.status(400).json({error: 'Missing title'});
        }

        const createdTask = await db.storeItem({name: name});

        try {
            await publishEvent('TaskCreated', { taskId: createdTask.id, name: createdTask.name });
        } catch (err) {
            console.error('Failed to publish TaskCreated event:', err);
        }

        return res.status(201).json(createdTask);
    } catch (err) {
        res.status(500).json(err);
    }
};
