const db = require('../persistence');

module.exports = async (req, res) => {
    try {
        const items = await db.getItems();
        return res.status(200).json(items || []);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};
