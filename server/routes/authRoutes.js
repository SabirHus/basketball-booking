const router = require("express").Router();
const authController = require("../controllers/authController");
const authorize = require("../middleware/authorization"); 
const upload = require("../middleware/upload");

// AUTHENTICATION & IDENTITY ROUTES

// Public routes for user onboarding and session generation
router.post("/register", authController.register);
router.post("/login", authController.login);

// Lightweight protected route used by the React frontend to verify token validity on page load
router.get("/verify", authorize, authController.verify);

// PROFILE MANAGEMENT ROUTES

// Retrieve the authenticated user's profile data
router.get("/profile", authorize, authController.getProfile);

// Update the authenticated user's profile information, including optional profile image upload
router.put("/profile", authorize, upload.single('image'), authController.updateProfile);

module.exports = router;