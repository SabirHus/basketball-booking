const router = require("express").Router();
const authController = require("../controllers/authController");

// 1. REGISTER (http://localhost:5000/auth/register)
router.post("/register", authController.register);

// 2. LOGIN (http://localhost:5000/auth/login)
router.post("/login", authController.login);

module.exports = router;