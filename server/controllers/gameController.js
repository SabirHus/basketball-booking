const pool = require("../db");

// 1. HOST A GAME
exports.hostGame = async (req, res) => {
    try {
        const { courtName, latitude, longitude, date, skillLevel } = req.body;
        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, courtName, latitude, longitude, date, skillLevel]
        );
        res.json(newGame.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 2. GET ALL GAMES (For Map)
exports.getAllGames = async (req, res) => {
    try {
        const allGames = await pool.query(`
            SELECT games.*, users.username, 
            (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.game_id) as player_count 
            FROM games JOIN users ON games.host_id = users.user_id
        `);
        res.json(allGames.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 3. JOIN A GAME
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length > 0) return res.status(400).json("You already joined this game!");

        await pool.query("INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)", [gameId, req.user.id]);
        res.json("Joined successfully!");
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 4. GET MY GAMES (Advanced SQL Joins)
exports.getMyGames = async (req, res) => {
    try {
        const userId = req.user.id;
        // A. Games I am Hosting
        const hosted = await pool.query("SELECT * FROM games WHERE host_id = $1 ORDER BY date_time ASC", [userId]);
        
        // B. Games I have Joined
        const joined = await pool.query(`
            SELECT games.* FROM games 
            JOIN game_players ON games.game_id = game_players.game_id 
            WHERE game_players.user_id = $1 ORDER BY games.date_time ASC
        `, [userId]);

        res.json({ hosted: hosted.rows, joined: joined.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 5. DELETE A GAME (Only the Host can do this)
exports.deleteGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        // The "ON DELETE CASCADE" in your database will automatically remove the players connected to this game
        const deleteOp = await pool.query("DELETE FROM games WHERE game_id = $1 AND host_id = $2 RETURNING *", [gameId, req.user.id]);
        
        if (deleteOp.rows.length === 0) return res.status(403).json("Not authorized to delete this game");
        res.json("Game Deleted Successfully");
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 6. LEAVE A GAME (Players backing out)
exports.leaveGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        await pool.query("DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        res.json("Left Game Successfully");
    } catch (err) {
        res.status(500).send("Server Error");
    }
};