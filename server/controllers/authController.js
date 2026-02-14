const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. REGISTER USER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("Registering user:", email); // Debug Log

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists!");
        }

        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, bcryptPassword]
        );

        // Generate Token
        if (!process.env.jwtSecret) {
            console.error("ERROR: jwtSecret is missing in .env file");
            return res.status(500).json("Server Configuration Error");
        }

        const token = jwt.sign({ id: newUser.rows[0].user_id }, process.env.jwtSecret, { expiresIn: "1h" });

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
            console.log("Login Failed: User not found");
            return res.status(401).json("Password or Email is incorrect");
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            console.log("Login Failed: Wrong Password");
            return res.status(401).json("Password or Email is incorrect");
        }

        // Generate Token
        if (!process.env.jwtSecret) {
            console.error("CRITICAL ERROR: process.env.jwtSecret is undefined! Check your .env file.");
            return res.status(500).json("Server Error: JWT Secret missing");
        }

        const token = jwt.sign({ id: user.rows[0].user_id }, process.env.jwtSecret, { expiresIn: "1h" });
        
        console.log("Login Successful for:", email);
        res.json({ token });

    } catch (err) {
        console.error("Server Error in Login:", err.message);
        res.status(500).send("Server Error: " + err.message);
    }
};

// 3. GET USER NAME (For Dashboard)
exports.getName = async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT username FROM users WHERE user_id = $1", 
            [req.user.id]
        );
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};