const pool = require("../db");

exports.hostGame = async (req, res) => {
    try {
        const { courtName, latitude, longitude, date, skillLevel } = req.body;
        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [req.user.id, courtName, latitude, longitude, date, skillLevel]
        );
        res.json(newGame.rows);
    } catch (err) { res.status(500).send("Server Error"); }
};

exports.getAllGames = async (req, res) => {
    try {
        const allGames = await pool.query(`
            SELECT games.*, users.username, 
            (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.game_id) as player_count 
            FROM games JOIN users ON games.host_id = users.user_id
        `);
        res.json(allGames.rows);
    } catch (err) { res.status(500).send("Server Error"); }
};

exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length > 0) return res.status(400).json("You already joined this game!");

        await pool.query("INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)", [gameId, req.user.id]);
        res.json("Joined successfully!");
    } catch (err) { res.status(500).send("Server Error"); }
};

exports.getMyGames = async (req, res) => {
    try {
        const hosted = await pool.query("SELECT * FROM games WHERE host_id = $1 ORDER BY date_time ASC", [req.user.id]);
        const joined = await pool.query(`
            SELECT games.* FROM games 
            JOIN game_players ON games.game_id = game_players.game_id 
            WHERE game_players.user_id = $1 ORDER BY games.date_time ASC
        `, [req.user.id]);
        res.json({ hosted: hosted.rows, joined: joined.rows });
    } catch (err) { res.status(500).send("Server Error"); }
};

exports.deleteGame = async (req, res) => {
    try {
        const deleteOp = await pool.query("DELETE FROM games WHERE game_id = $1 AND host_id = $2 RETURNING *", [req.params.gameId, req.user.id]);
        if (deleteOp.rows.length === 0) return res.status(403).json("Not authorized");
        res.json("Deleted");
    } catch (err) { res.status(500).send("Server Error"); }
};

exports.leaveGame = async (req, res) => {
    try {
        await pool.query("DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", [req.params.gameId, req.user.id]);
        res.json("Left");
    } catch (err) { res.status(500).send("Server Error"); }
};

// --- SPRINT 5: STRIPE ---
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckout = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) return res.status(400).json("Already joined!");

        const game = await pool.query("SELECT * FROM games WHERE game_id = $1", [gameId]);
        if (game.rows.length === 0) return res.status(404).json("Not found");
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "gbp",
                    product_data: { name: `CourtLink: ${game.rows.court_name}` },
                    unit_amount: 500,
                },
                quantity: 1,
            }],
            success_url: `http://localhost:5173/success?gameId=${gameId}`,
            cancel_url: `http://localhost:5173/dashboard`, 
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Error:", err.message);
        res.status(500).send("Server Error");
    }
};