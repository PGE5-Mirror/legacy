const taskService = require('../../services/tasks.service');

module.exports = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ error: "Name field cannot be empty." });
        }

        const item = await taskService.createItem({
            name: req.body.name,
        });

        return res.status(201).json(item);
    } catch (error) {
        return res.status(400).json({ error: "Error while executing" });
    }
};
