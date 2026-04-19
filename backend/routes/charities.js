const express = require('express');
const router = express.Router();
const { getCharities, getCharityById, selectCharity, getMySelection } = require('../controllers/charityController');
const { protect } = require('../middleware/auth');

router.get('/', getCharities);
router.get('/my-selection', protect, getMySelection);
router.get('/:id', getCharityById);
router.post('/select', protect, selectCharity);

module.exports = router;
