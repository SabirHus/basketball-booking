const pool = require('../db'); // Connect to Neon
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(401).json({ message: "User already exists!" });
        }

        // Hash the password (Security Best Practice)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Save to Database
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [username, email, passwordHash]
        );

        // Generate Token (The "ID Card")
        const token = jwt.sign(
            { id: newUser.rows[0].user_id }, 
            "secret_key_123", // In production, use process.env.JWT_SECRET
            { expiresIn: "1h" }
        );

        res.json({ token, user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};