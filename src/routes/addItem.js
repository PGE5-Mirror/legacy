const db = require('../persistence');
const { v4: uuid } = require('uuid');
const { publishEvent } = require('../events/rabbitmq');

module.exports = async (req, res) => {
  const item = {
    id: uuid(),
    name: req.body.name,
    completed: false,
  };

  await db.storeItem(item);

  try {
    await publishEvent('TaskCreated', { taskId: item.id, name: item.name });
  } catch (err) {
    console.error('Failed to publish TaskCreated event:', err);
  }

  res.send(item);
};
