const express = require('express');
const router = express.Router();

const getItems = require('./items/getItems');
const addItem = require('./items/addItem');
const updateItem = require('./items/updateItem');
const deleteItem = require('./items/deleteItem');

router.get('/items', getItems);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

module.exports = router;