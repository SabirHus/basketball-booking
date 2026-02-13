const pool = require("../db");

exports.hostGame = async (req, res) => {
    try {
        console.log("--- HOST GAME REQUEST RECEIVED ---");
        console.log("1. User Data from Token:", req.user); // Check if we know WHO is logged in
        console.log("2. Game Data:", req.body);            // Check WHAT they are sending

        const { courtName, latitude, longitude, date, skillLevel } = req.body;
        
        // CRITICAL CHECK: Did the Auth Middleware work?
        if (!req.user || !req.user.id) {
            console.error("ERROR: User ID is missing. Authorization middleware failed.");
            return res.status(401).json({ message: "User not authorized" });
        }

        const host_id = req.user.id;

        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [host_id, courtName, latitude, longitude, date, skillLevel]
        );

        console.log("3. Success! Game Saved:", newGame.rows[0]);
        res.json(newGame.rows[0]);

    } catch (err) {
        // THIS WILL PRINT THE REAL ERROR IN YOUR TERMINAL
        console.error("!!! SERVER CRASH !!!");
        console.error(err.message);
        res.status(500).send("Server Error: " + err.message);
    }
};

exports.getAllGames = async (req, res) => {
    try {
        const allGames = await pool.query(
            "SELECT games.*, users.username FROM games JOIN users ON games.host_id = users.user_id"
        );
        res.json(allGames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};