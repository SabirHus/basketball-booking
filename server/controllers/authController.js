const pool = require("../db");
const bcrypt = require("bcrypt");
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
        console.error("Server Error in Register:", err.message);
        res.status(500).send("Server Error: " + err.message);
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Attempting Login for:", email); // Debug Log

        // Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Password or Email is incorrect" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: "Password or Email is incorrect" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.rows[0].user_id },
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 3. GET USER NAME
exports.getName = async (req, res) => {
    try {
        const user = await pool.query("SELECT username FROM users WHERE user_id = $1", [req.user.id]);
        res.json(user.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};