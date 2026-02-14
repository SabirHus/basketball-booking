const pool = require("../db");

// 1. HOST A GAME
exports.hostGame = async (req, res) => {
    try {
        const { courtName, latitude, longitude, date, skillLevel } = req.body;
        const host_id = req.user.id;

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

// 2. GET ALL GAMES (With Player Count)
exports.getAllGames = async (req, res) => {
    try {
        // This complex query gets the game info AND counts how many players joined
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

// 3. JOIN A GAME
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params; // Get ID from URL
        const userId = req.user.id;    // Get ID from Token

        // check if already joined
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) {
            return res.status(400).json("You already joined this game!");
        }

        await pool.query(
            "INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
            [gameId, userId]
        );

        res.json("Joined Successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};