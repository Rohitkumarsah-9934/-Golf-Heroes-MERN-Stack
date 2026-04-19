const express = require('express');
const router = express.Router();
const { getPublishedDraws, getDrawById, getMyEntry } = require('../controllers/drawController');
const { protect } = require('../middleware/auth');

router.get('/', getPublishedDraws);
router.get('/:id', getDrawById);
router.get('/:id/my-entry', protect, getMyEntry);

module.exports = router;
