const express = require('express');
const { registerUser, loginUser } = require ('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/suggested-friends', authMiddleware, authController.getSuggestedFriends);
// Add to authRoutes.js
router.post('/friend-request', authMiddleware, authController.sendFriendRequest);

router.post("/register", registerUser, authMiddleware);
router.post("/login", loginUser, authMiddleware);


module.exports = router;
