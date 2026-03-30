const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// Define routes for habits
router.get('/', habitController.getAllHabits);
router.post('/', habitController.createHabit);
router.put('/:id/complete', habitController.completeHabit);
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
