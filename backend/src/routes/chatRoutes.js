const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/chat/:otherUserId
router.get('/:otherUserId', verifyToken, getMessages);

module.exports = router;
