const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. USER REGISTRATION
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Prevent duplicate accounts by checking the database for existing emails
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists!");
        }

        // Hash the user's password using bcrypt with a salt to protect against rainbow table attacks and ensure secure storage of credentials
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // Persist the new user credentials securely
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [username, email, bcryptPassword]
        );

        // Generate a JSON Web Token (JWT) valid for 1 hour to manage session state
        const token = jwt.sign({ id: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).send("Server Error");
    }
};

// 2. USER LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verify the user exists in the database
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            // Use a generic error message to prevent malicious actors from enumerating valid emails
            return res.status(401).json("Invalid email or password");
        }

        // Compare the provided plain-text password against the stored bcrypt hash
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json("Invalid email or password");
        }

        // Issue a new session token upon successful authentication
        const token = jwt.sign({ id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Server Error");
    }
};

// 3. TOKEN VERIFICATION
exports.verify = async (req, res) => {
    try {
        // This endpoint acts as a lightweight boolean check for the frontend routing guard
        res.json(true);
    } catch (err) {
        console.error("Verification Error:", err.message);
        res.status(500).send("Server Error");
    }
};

// 4. FETCH USER PROFILE
exports.getProfile = async (req, res) => {
    try {
        // Explicitly select safe columns to prevent accidental data leaks (like password hashes)
        const user = await pool.query(
            "SELECT user_id, username, email, is_admin, bio, position, profile_pic FROM users WHERE user_id = $1", 
            [req.user.id]
        );
        res.json(user.rows[0]); 
    } catch (err) {
        console.error("Get Profile Error:", err.message);
        res.status(500).send("Server Error");
    }
};

// 5. UPDATE USER PROFILE (IMAGE UPLOAD)
exports.updateProfile = async (req, res) => {
    try {
        const { bio, position } = req.body;
        const userId = req.user.id;
        
        // Check if the Multer/Cloudinary middleware successfully attached a cloud URL to the request
        let profilePicUrl = req.body.existing_pic; 
        if (req.file) {
            profilePicUrl = req.file.path; 
        }

        // Execute a parameterized query to update the user's profile information, including the new profile picture URL if provided
        const updatedUser = await pool.query(
            `UPDATE users 
             SET bio = $1, position = $2, profile_pic = $3 
             WHERE user_id = $4 
             RETURNING user_id, username, email, is_admin, bio, position, profile_pic`,
            [bio, position, profilePicUrl, userId]
        );

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error("Update Profile Error:", err.message);
        res.status(500).send("Server Error");
    }
};