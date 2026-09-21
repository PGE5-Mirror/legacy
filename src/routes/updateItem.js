const db = require('../persistence');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, completed, status } = req.body;

        const existing = await db.getItem(id);
        if (!existing) {
            return res.status(404).json({message: `Item with id ${id} not found`});
        }

        const updateData = {
            name: name,
            completed: completed,
        }
        await db.updateItem(id, updateData);
        const item = await db.getItem(id);
        return res.status(200).json(item);
    } catch (err) {
        return res.status(500).send({error: err.message});
    }
};
