require("dotenv").config();
const pool = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 1. HOST A GAME
exports.hostGame = async (req, res) => {
    try {
        const { courtName, latitude, longitude, date, skillLevel, price, maxPlayers } = req.body;
        
        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level, price, max_players) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [req.user.id, courtName, latitude, longitude, date, skillLevel, price || 0, maxPlayers || 10]
        );
        res.json(newGame.rows);
    } catch (err) { 
        console.error("Host Error:", err);
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
        console.error("Get All Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 3. JOIN FREE GAME
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        // Check capacity
        const gameRes = await pool.query(`
            SELECT max_players, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found");
        
        const game = gameRes.rows;

        if (parseInt(game.player_count) >= game.max_players) {
            return res.status(400).json("Game is full!");
        }

        // Check if already joined
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length > 0) return res.status(400).json("You already joined this game!");

        await pool.query("INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)", [gameId, req.user.id]);
        res.json("Joined successfully!");
    } catch (err) { 
        console.error("Join Game Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 4. STRIPE CHECKOUT (Paid Games)
exports.createCheckout = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        // Check if already joined
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) return res.status(400).json("Already joined!");

        // Get Game info and verify capacity
        const gameRes = await pool.query(`
            SELECT *, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Not found");
        const game = gameRes.rows;

        if (parseInt(game.player_count) >= game.max_players) {
            return res.status(400).json("Game is full!");
        }

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "gbp",
                    product_data: { name: `CourtLink: ${game.court_name}` },
                    // Force a valid number (fallback to £5 if db price is null/broken)
                    unit_amount: Math.round(parseFloat(game.price || 5) * 100), 
                },
                quantity: 1,
            }],
            success_url: `http://localhost:5173/success?gameId=${gameId}`,
            cancel_url: `http://localhost:5173/dashboard`, 
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Error Details:", err.message);
        res.status(500).send("Server Error");
    }
};

// 5. GET MY GAMES (Profile Page)
exports.getMyGames = async (req, res) => {
    try {
        const hosted = await pool.query("SELECT * FROM games WHERE host_id = $1 ORDER BY date_time ASC", [req.user.id]);
        const joined = await pool.query(`
            SELECT games.* FROM games JOIN game_players ON games.game_id = game_players.game_id 
            WHERE game_players.user_id = $1 ORDER BY games.date_time ASC
        `, [req.user.id]);
        res.json({ hosted: hosted.rows, joined: joined.rows });
    } catch (err) { 
        console.error("Get My Games Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 6. DELETE A GAME
exports.deleteGame = async (req, res) => {
    try {
        const deleteOp = await pool.query("DELETE FROM games WHERE game_id = $1 AND host_id = $2 RETURNING *", [req.params.gameId, req.user.id]);
        if (deleteOp.rows.length === 0) return res.status(403).json("Not authorized");
        res.json("Deleted");
    } catch (err) { 
        console.error("Delete Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 7. LEAVE A GAME
exports.leaveGame = async (req, res) => {
    try {
        await pool.query("DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", [req.params.gameId, req.user.id]);
        res.json("Left");
    } catch (err) { 
        console.error("Leave Error:", err);
        res.status(500).send("Server Error"); 
    }
};