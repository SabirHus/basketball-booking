const pool = require("../db");

// 1. HOST A GAME
exports.hostGame = async (req, res) => {
    try {
        const { courtName, latitude, longitude, date, skillLevel } = req.body;
<<<<<<< HEAD
        const host_id = req.user.id; // Gets ID from the token
=======
        const host_id = req.user.id;
>>>>>>> 12ac0134cfe4b977a1c5f500cb37953dd2d0d3d1

        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [host_id, courtName, latitude, longitude, date, skillLevel]
        );

        res.json(newGame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

<<<<<<< HEAD
// 2. GET ALL GAMES 
exports.getAllGames = async (req, res) => {
    try {
=======
// 2. GET ALL GAMES (Updated to include Player Count)
exports.getAllGames = async (req, res) => {
    try {
        // This SQL query joins users to games AND counts the players in each game
>>>>>>> 12ac0134cfe4b977a1c5f500cb37953dd2d0d3d1
        const allGames = await pool.query(`
            SELECT games.*, users.username, 
            (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.game_id) as player_count 
            FROM games 
            JOIN users ON games.host_id = users.user_id
        `);
        res.json(allGames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

<<<<<<< HEAD
// 3. JOIN A GAME
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        // Check if already joined
=======
// 3. JOIN A GAME (New Feature)
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params; // ID from the URL
        const userId = req.user.id;    // ID from the Logged in User

        // 1. Check if already joined
>>>>>>> 12ac0134cfe4b977a1c5f500cb37953dd2d0d3d1
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) {
            return res.status(400).json("You already joined this game!");
        }

<<<<<<< HEAD
=======
        // 2. Add to table
>>>>>>> 12ac0134cfe4b977a1c5f500cb37953dd2d0d3d1
        await pool.query(
            "INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
            [gameId, userId]
        );

<<<<<<< HEAD
        res.json("Joined successfully!");
=======
        res.json("Joined Successfully");
>>>>>>> 12ac0134cfe4b977a1c5f500cb37953dd2d0d3d1
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};