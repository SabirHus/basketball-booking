const pool = require("../db");
const bcrypt = require("bcrypt.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. REGISTER USER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists!");
        }

        // Hash the password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // ⬇️ UPDATED: Uses 'password_hash' to match your database
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [username, email, bcryptPassword]
        );

        // Generate Token
        const token = jwt.sign({ id: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Password or Email is incorrect" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Password or Email is incorrect" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.rows[0].user_id },
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ token, user: user.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 3. GET USER DATA (Upgraded to include Admin Status!)
exports.getName = async (req, res) => {
    try {
        // 🚀 THE FIX: Now we are grabbing user_id, email, and is_admin too!
        const user = await pool.query(
            "SELECT user_id, username, email, is_admin FROM users WHERE user_id = $1", 
            [req.user.id]
        );
        res.json(user.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 4. GET FULL USER PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT user_id, username, email, is_admin, bio, position, profile_pic FROM users WHERE user_id = $1", 
            [req.user.id]
        );
        res.json(user.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 5. UPDATE PROFILE (With Image Upload)
exports.updateProfile = async (req, res) => {
    try {
        const { bio, position } = req.body;
        const userId = req.user.id;
        
        // If the user uploaded a file, Multer/Cloudinary will attach the cloud URL to req.file.path
        let profilePicUrl = req.body.existing_pic; 
        if (req.file) {
            profilePicUrl = req.file.path; 
        }

        const updatedUser = await pool.query(
            "UPDATE users SET bio = $1, position = $2, profile_pic = $3 WHERE user_id = $4 RETURNING user_id, username, bio, position, profile_pic",
            [bio, position, profilePicUrl, userId]
        );

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).send("Server Error");
    }
};