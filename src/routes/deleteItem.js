const db = require('../persistence');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(404).json({error: 'Missing id'});

        const existing = await db.getItem(id);
        if (!existing) {
            return res.status(404).json({message: `Task not found`});
        }

        await db.removeItem(id);
        return res.sendStatus(204);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};
