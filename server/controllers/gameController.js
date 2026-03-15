require("dotenv").config();
const pool = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 1. HOST A GAME (Sprint 6 Upgraded)
exports.hostGame = async (req, res) => {
    try {
        // Accepts both camelCase (old frontend) and snake_case (new frontend) safely!
        const courtName = req.body.court_name || req.body.courtName;
        const date = req.body.date_time || req.body.date;
        const skillLevel = req.body.skill_level || req.body.skillLevel;
        const maxPlayers = req.body.max_players || req.body.maxPlayers;
        const { latitude, longitude, price } = req.body;
        
        const finalPrice = price ? parseFloat(price) : 0;
        const finalMaxPlayers = maxPlayers ? parseInt(maxPlayers) : 10;

        // 🛑 SPRINT 6: Block past dates
        const gameDate = new Date(date);
        const rightNow = new Date();
        if (gameDate < rightNow) {
            return res.status(400).json("Error: You cannot host a game in the past!");
        }

        const newGame = await pool.query(
            "INSERT INTO games (host_id, court_name, latitude, longitude, date_time, skill_level, price, max_players, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open') RETURNING *",
            [req.user.id, courtName, latitude, longitude, date, skillLevel, finalPrice, finalMaxPlayers]
        );
        
        // 🛑 SPRINT 6: Auto-join the host into the lobby!
        await pool.query(
            "INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
            [newGame.rows[0].game_id, req.user.id]
        );

        res.json(newGame.rows[0]); 
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
        
        const gameRes = await pool.query(`
            SELECT max_players, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found");
        
        const game = gameRes.rows[0]; // 👈 Fixed the array destructuring bug here!

        if (parseInt(game.player_count) >= game.max_players) {
            return res.status(400).json("Game is full!");
        }

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

        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) return res.status(400).json("Already joined!");

        const gameRes = await pool.query(`
            SELECT *, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Not found");
        
        const [game] = gameRes.rows; 

        if (parseInt(game.player_count) >= game.max_players) {
            return res.status(400).json("Game is full!");
        }

        const dbPrice = parseFloat(game.price);
        const stripePriceInPennies = Math.round(dbPrice * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "gbp",
                    product_data: { name: `CourtLink: ${game.court_name}` },
                    unit_amount: stripePriceInPennies, 
                },
                quantity: 1,
            }],
            success_url: `http://localhost:5173/success?gameId=${gameId}`,
            cancel_url: `http://localhost:5173/dashboard`, 
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("👉 STRIPE CRASH REASON:", err.message);
        res.status(500).send("Server Error");
    }
};

// 5. GET MY GAMES (Profile Page - RESTORED TO ORIGINAL!)
exports.getMyGames = async (req, res) => {
    try {
        const hosted = await pool.query("SELECT * FROM games WHERE host_id = $1 ORDER BY date_time ASC", [req.user.id]);
        const joined = await pool.query(`
            SELECT games.* FROM games JOIN game_players ON games.game_id = game_players.game_id 
            WHERE game_players.user_id = $1 ORDER BY games.date_time ASC
        `, [req.user.id]);
        
        // Sending the split object just like your old code did!
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

// 🚀 SPRINT 6: NEW LOBBY FEATURES BELOW 🚀

// 8. GET PLAYERS FOR LOBBY
exports.getGamePlayers = async (req, res) => {
    try {
        const { gameId } = req.params;
        const players = await pool.query(`
            SELECT users.user_id, users.username 
            FROM game_players 
            JOIN users ON game_players.user_id = users.user_id 
            WHERE game_players.game_id = $1
        `, [gameId]);
        res.json(players.rows);
    } catch (err) {
        console.error("Get Players Error:", err);
        res.status(500).send("Server Error");
    }
};

// 9. GET MESSAGES FOR LOBBY
exports.getGameMessages = async (req, res) => {
    try {
        const { gameId } = req.params;
        const messages = await pool.query(`
            SELECT game_messages.*, users.username 
            FROM game_messages 
            JOIN users ON game_messages.user_id = users.user_id 
            WHERE game_messages.game_id = $1 
            ORDER BY created_at ASC
        `, [gameId]);
        res.json(messages.rows);
    } catch (err) {
        console.error("Get Messages Error:", err);
        res.status(500).send("Server Error");
    }
};

// 10. SEND MESSAGE IN LOBBY
exports.sendMessage = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { message } = req.body;
        
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length === 0) return res.status(403).json("You must join the game to chat.");

        const newMessage = await pool.query(
            "INSERT INTO game_messages (game_id, user_id, message) VALUES ($1, $2, $3) RETURNING *",
            [gameId, req.user.id, message]
        );
        
        res.json(newMessage.rows[0]);
    } catch (err) {
        console.error("Send Message Error:", err);
        res.status(500).send("Server Error");
    }
};

// 11. RATE A HOST (Task 6.5)
exports.rateHost = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { rating, hostId } = req.body;
        const raterId = req.user.id;

        // 1. Check if the game has already happened
        const gameRes = await pool.query("SELECT date_time FROM games WHERE game_id = $1", [gameId]);
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found.");
        
        const gameDate = new Date(gameRes.rows[0].date_time);
        if (gameDate > new Date()) {
            return res.status(400).json("You can only rate the host AFTER the game has finished!");
        }

        // 2. Check if they already rated this game
        const checkRating = await pool.query("SELECT * FROM host_ratings WHERE game_id = $1 AND rater_id = $2", [gameId, raterId]);
        if (checkRating.rows.length > 0) {
            return res.status(400).json("You have already rated the host for this game.");
        }

        // 3. Save the rating
        await pool.query(
            "INSERT INTO host_ratings (game_id, rater_id, host_id, rating) VALUES ($1, $2, $3, $4)",
            [gameId, raterId, hostId, rating]
        );

        res.json("Rating submitted successfully!");
    } catch (err) {
        console.error("Rate Host Error:", err);
        res.status(500).send("Server Error");
    }
};

// 12. GET A HOST'S AVERAGE RATING
exports.getHostRating = async (req, res) => {
    try {
        const { hostId } = req.params;
        const result = await pool.query(`
            SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(rating) as total_ratings 
            FROM host_ratings WHERE host_id = $1
        `, [hostId]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Get Rating Error:", err);
        res.status(500).send("Server Error");
    }
};