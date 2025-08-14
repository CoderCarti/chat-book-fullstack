const express = require("express");
const { registerUser, loginUser } = require ('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/register", registerUser, authMiddleware);
router.post("/login", loginUser, authMiddleware);


module.exports = router;
