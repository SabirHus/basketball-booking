const router = require('express').Router();
const authController = require('../controllers/authController');

// This triggers the register function when someone visits /auth/register
router.post('/register', authController.register);

module.exports = router;