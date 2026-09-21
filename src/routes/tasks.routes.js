const express = require('express');
const router = express.Router();

const createTask = require('./tasks/createTask');

router.post('/tasks', createTask);

module.exports = router;