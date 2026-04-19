const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getMyScores, addScore, updateScore, deleteScore } = require('../controllers/scoreController');
const { protect, requireSubscription } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyScores);
router.post('/', requireSubscription, [
  body('score').isInt({ min: 1, max: 45 }).withMessage('Score must be 1–45'),
  body('scoreDate').isISO8601().withMessage('Valid date required'),
], addScore);
router.put('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;
