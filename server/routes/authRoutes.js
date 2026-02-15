const router = require("express").Router();
const authController = require("../controllers/authController");
const authorize = require("../middleware/authorization"); // Import middleware

// POST http://localhost:5000/auth/register
router.post("/register", authController.register);

// POST http://localhost:5000/auth/login
router.post("/login", authController.login);

// GET http://localhost:5000/auth/verify (Protected)
router.get("/verify", authorize, authController.getName);

module.exports = router;