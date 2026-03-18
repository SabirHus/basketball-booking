const router = require("express").Router();
const authController = require("../controllers/authController");
const authorize = require("../middleware/authorization"); 
const upload = require("../middleware/upload");

// POST http://localhost:5000/auth/register
router.post("/register", authController.register);

// POST http://localhost:5000/auth/login
router.post("/login", authController.login);

// GET http://localhost:5000/auth/verify (Protected)
router.get("/verify", authorize, authController.getName);

// PROFILE ROUTES
router.get("/profile", authorize, authController.getProfile);

// Note: upload.single('image') tells Multer to look for an uploaded file named 'image'
router.put("/profile", authorize, upload.single('image'), authController.updateProfile);

module.exports = router;