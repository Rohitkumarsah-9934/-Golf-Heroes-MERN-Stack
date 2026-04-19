const express = require('express');
const router = express.Router();
const { getMyWinnings, submitProof, uploadMiddleware } = require('../controllers/winnerController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/my-winnings', getMyWinnings);
router.post('/:id/submit-proof', uploadMiddleware, submitProof);

module.exports = router;
