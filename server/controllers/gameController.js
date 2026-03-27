require("dotenv").config();
const pool = require("../db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendConfirmationEmail, sendCancellationEmail, sendKickedEmail, sendUpdateEmail, sendGameOnEmail } = require("../utils/sendEmail");

// 1. HOST A NEW GAME
exports.hostGame = async (req, res) => {
    try {
        // Normalise incoming payload data to handle potential frontend casing variations
        const courtName = req.body.court_name || req.body.courtName;
        const address = req.body.address || "Address not provided"; 
        const date = req.body.date_time || req.body.date;
        const skillLevel = req.body.skill_level || req.body.skillLevel;
        const maxPlayers = req.body.max_players || req.body.maxPlayers;
        const minPlayers = req.body.min_players || req.body.minPlayers;
        const { latitude, longitude, price } = req.body;
        
        // Parse numerics safely applying defaults where necessary
        const finalPrice = price ? parseFloat(price) : 0;
        const finalMaxPlayers = maxPlayers ? parseInt(maxPlayers, 10) : 10;
        const finalMinPlayers = minPlayers ? parseInt(minPlayers, 10) : 4;

        // Prevent users from scheduling games in the past
        const gameDate = new Date(date);
        if (gameDate < new Date()) {
            return res.status(400).json("Error: You cannot host a game in the past.");
        }

        // Persist the game data into the relational database
        const newGame = await pool.query(
            `INSERT INTO games (host_id, court_name, address, latitude, longitude, date_time, skill_level, price, max_players, min_players, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open') RETURNING *`,
            [req.user.id, courtName, address, latitude, longitude, date, skillLevel, finalPrice, finalMaxPlayers, finalMinPlayers]
        );
        
        // Automatically enrol the host as the first player in the roster
        await pool.query(
            "INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
            [newGame.rows[0].game_id, req.user.id]
        );

        res.json(newGame.rows[0]); 
    } catch (err) { 
        console.error("Host Game Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 2. FETCH ALL ACTIVE GAMES
exports.getAllGames = async (req, res) => {
    try {
        const allGames = await pool.query(`
            SELECT games.*, users.username, 
            (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.game_id) as player_count 
            FROM games 
            JOIN users ON games.host_id = users.user_id
            WHERE games.date_time >= NOW()
        `);
        res.json(allGames.rows);
    } catch (err) { 
        console.error("Fetch Games Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 3. JOIN A FREE GAME
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const gameRes = await pool.query(`
            SELECT max_players, min_players, court_name, address, date_time, price, 
            (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found.");
        const game = gameRes.rows[0]; 

        if (parseInt(game.player_count, 10) >= parseInt(game.max_players, 10)) {
            return res.status(400).json("This game has reached maximum capacity.");
        }

        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length > 0) return res.status(400).json("You have already joined this game.");

        const { sessionId } = req.body;

        await pool.query(
            "INSERT INTO game_players (game_id, user_id, stripe_session_id) VALUES ($1, $2, $3)", 
            [gameId, req.user.id, sessionId || null]
        );

        // Fetch user details for confirmation
        const userRes = await pool.query("SELECT username, email FROM users WHERE user_id = $1", [req.user.id]);
        const user = userRes.rows[0];

        // Send confirmation email with the latest player count to the new joiner
        const newPlayerCount = parseInt(game.player_count, 10) + 1;
        sendConfirmationEmail(user.email, user.username, game.court_name, game.address, game.date_time, game.price, sessionId, newPlayerCount, game.min_players, game.max_players);

        // If this specific user joining hits the minimum threshold exactly, email everyone on the roster!
        if (newPlayerCount === parseInt(game.min_players, 10)) {
            const roster = await pool.query(`
                SELECT u.email, u.username 
                FROM game_players gp JOIN users u ON gp.user_id = u.user_id 
                WHERE gp.game_id = $1
            `, [gameId]);

            for (let player of roster.rows) {
                sendGameOnEmail(player.email, player.username, game.court_name, game.date_time);
            }
        }

        res.json("Joined successfully!");
    } catch (err) { 
        console.error("Join Game Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 4. INITIATE STRIPE CHECKOUT
exports.createCheckout = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        // Perform standard capacity and duplication checks before processing payment
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, userId]);
        if (check.rows.length > 0) return res.status(400).json("You have already joined this game.");

        const gameRes = await pool.query(`
            SELECT *, (SELECT COUNT(*) FROM game_players WHERE game_id = $1) as player_count 
            FROM games WHERE game_id = $1
        `, [gameId]);
        
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found.");
        
        const [game] = gameRes.rows; 

        if (parseInt(game.player_count, 10) >= parseInt(game.max_players, 10)) {
            return res.status(400).json("This game has reached maximum capacity.");
        }

        // Stripe requires financial calculations to be processed in the smallest currency unit (pennies)
        const dbPrice = parseFloat(game.price);
        const stripePriceInPennies = Math.round(dbPrice * 100);

        // Generate a secure Stripe hosted checkout session
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
            // Embed the game ID and Stripe session ID in the success URL for post-payment processing on the frontend
            success_url: `${process.env.CLIENT_URL}/#/success?gameId=${gameId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/#/dashboard`, 
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Initialization Error:", err.message);
        res.status(500).send("Server Error processing checkout");
    }
};

// 5. FETCH USER SPECIFIC GAMES
exports.getMyGames = async (req, res) => {
    try {
        const hosted = await pool.query("SELECT * FROM games WHERE host_id = $1 ORDER BY date_time ASC", [req.user.id]);
        
        // Added a LEFT JOIN to fetch the user's existing rating for each past game they joined
        const joined = await pool.query(`
            SELECT games.*, hr.rating AS my_rating
            FROM games 
            JOIN game_players ON games.game_id = game_players.game_id 
            LEFT JOIN host_ratings hr ON games.game_id = hr.game_id AND hr.rater_id = $1
            WHERE game_players.user_id = $1 ORDER BY games.date_time ASC
        `, [req.user.id]);
        
        res.json({ hosted: hosted.rows, joined: joined.rows });
    } catch (err) { 
        console.error("Fetch My Games Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 6. DELETE GAME & PROCESS AUTOMATED REFUNDS
exports.deleteGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id; 

        const userQuery = await pool.query("SELECT is_admin FROM users WHERE user_id = $1", [userId]);
        const gameQuery = await pool.query("SELECT host_id, court_name, date_time FROM games WHERE game_id = $1", [gameId]);

        if (gameQuery.rows.length === 0) return res.status(404).json("Game not found.");

        const isAdmin = userQuery.rows[0].is_admin;
        const game = gameQuery.rows[0];

        if (!isAdmin && String(game.host_id) !== String(userId)) {
            return res.status(403).json("Unauthorised. You can only delete your own games.");
        }

        // Get all players on the roster to email them and process refunds
        const allPlayers = await pool.query(
            `SELECT gp.stripe_session_id, u.email, u.username 
             FROM game_players gp JOIN users u ON gp.user_id = u.user_id 
             WHERE gp.game_id = $1 AND gp.user_id != $2`, 
            [gameId, game.host_id] // Don't email the host about their own deletion
        );

        for (let player of allPlayers.rows) {
            let wasPaid = false;
            // Process refund if they paid
            if (player.stripe_session_id) {
                try {
                    const session = await stripe.checkout.sessions.retrieve(player.stripe_session_id);
                    if (session.payment_intent) {
                        await stripe.refunds.create({ payment_intent: session.payment_intent, reason: 'requested_by_customer' });
                        wasPaid = true;
                    }
                } catch (stripeErr) { console.error("Refund failed:", stripeErr.message); }
            }
            // Send cancellation email
            sendCancellationEmail(player.email, player.username, game.court_name, game.date_time, wasPaid);
        }

        await pool.query("DELETE FROM games WHERE game_id = $1", [gameId]);
        res.status(200).json("Game cancelled and automated emails/refunds processed successfully.");
    } catch (err) { 
        console.error("Game Deletion Error:", err);
        res.status(500).send("Server Error during deletion sequence."); 
    }
};

// 7. LEAVE A GAME
exports.leaveGame = async (req, res) => {
    try {
        await pool.query("DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", [req.params.gameId, req.user.id]);
        res.json("Successfully left the game.");
    } catch (err) { 
        console.error("Leave Game Error:", err);
        res.status(500).send("Server Error"); 
    }
};

// 8. FETCH LOBBY ROSTER
exports.getGamePlayers = async (req, res) => {
    try {
        const { gameId } = req.params;
        const players = await pool.query(`
            SELECT users.user_id, users.username, users.profile_pic, users.position, users.bio 
            FROM game_players 
            JOIN users ON game_players.user_id = users.user_id 
            WHERE game_players.game_id = $1
        `, [gameId]);
        res.json(players.rows);
    } catch (err) {
        console.error("Fetch Players Error:", err);
        res.status(500).send("Server Error");
    }
};

// 9. FETCH LOBBY MESSAGES
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
        console.error("Fetch Messages Error:", err);
        res.status(500).send("Server Error");
    }
};

// 10. DISPATCH LOBBY MESSAGE
exports.sendMessage = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { message } = req.body;
        
        // Only active roster members can broadcast messages to the lobby
        const check = await pool.query("SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, req.user.id]);
        if (check.rows.length === 0) return res.status(403).json("Unauthorised. You must join the roster to chat.");

        const newMessage = await pool.query(
            "INSERT INTO game_messages (game_id, user_id, message) VALUES ($1, $2, $3) RETURNING *",
            [gameId, req.user.id, message]
        );
        
        res.json(newMessage.rows[0]);
    } catch (err) {
        console.error("Message Dispatch Error:", err);
        res.status(500).send("Server Error");
    }
};

// 11. SUBMIT POST-GAME HOST RATING
exports.rateHost = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { rating, hostId } = req.body;
        const raterId = req.user.id;

        const gameRes = await pool.query("SELECT date_time FROM games WHERE game_id = $1", [gameId]);
        if (gameRes.rows.length === 0) return res.status(404).json("Game not found.");
        
        const gameDate = new Date(gameRes.rows[0].date_time);
        if (gameDate > new Date()) {
            return res.status(400).json("Ratings cannot be submitted until the game has concluded.");
        }

        // Check if the rater was a participant in the game to prevent fraudulent ratings
        const checkRating = await pool.query("SELECT * FROM host_ratings WHERE game_id = $1 AND rater_id = $2", [gameId, raterId]);
        
        if (checkRating.rows.length > 0) {
            await pool.query(
                "UPDATE host_ratings SET rating = $1 WHERE game_id = $2 AND rater_id = $3",
                [rating, gameId, raterId]
            );
            res.json("Rating updated successfully.");
        } else {
            await pool.query(
                "INSERT INTO host_ratings (game_id, rater_id, host_id, rating) VALUES ($1, $2, $3, $4)",
                [gameId, raterId, hostId, rating]
            );
            res.json("Rating recorded successfully.");
        }
    } catch (err) {
        console.error("Rate Host Error:", err);
        res.status(500).send("Server Error");
    }
};

// 12. COMPUTE HOST REPUTATION METRICS
exports.getHostRating = async (req, res) => {
    try {
        const { hostId } = req.params;
        
        // Compute the aggregate score dynamically directly within the SQL layer for efficiency
        const result = await pool.query(`
            SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(rating) as total_ratings 
            FROM host_ratings WHERE host_id = $1
        `, [hostId]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Fetch Host Rating Error:", err);
        res.status(500).send("Server Error");
    }
};

// 13. KICK PLAYER (HOST/ADMIN ONLY)
exports.kickPlayer = async (req, res) => {
    try {
        const { gameId, playerId } = req.params;
        
        const gameQuery = await pool.query("SELECT host_id, court_name, date_time FROM games WHERE game_id = $1", [gameId]);
        if (String(gameQuery.rows[0].host_id) !== String(req.user.id)) {
            return res.status(403).json("Only the host can kick players.");
        }

        // Get player details for refund and email
        const playerDetails = await pool.query(
            `SELECT gp.stripe_session_id, u.email, u.username 
             FROM game_players gp JOIN users u ON gp.user_id = u.user_id 
             WHERE gp.game_id = $1 AND gp.user_id = $2`, 
            [gameId, playerId]
        );

        if (playerDetails.rows.length > 0) {
            const player = playerDetails.rows[0];
            let wasPaid = false;

            // Issue refund if they paid
            if (player.stripe_session_id) {
                try {
                    const session = await stripe.checkout.sessions.retrieve(player.stripe_session_id);
                    if (session.payment_intent) {
                        await stripe.refunds.create({ payment_intent: session.payment_intent, reason: 'requested_by_customer' });
                        wasPaid = true;
                    }
                } catch (err) { console.error("Refund failed for kicked player:", err.message); }
            }

            // Send kicked email
            sendKickedEmail(player.email, player.username, gameQuery.rows[0].court_name, gameQuery.rows[0].date_time, wasPaid);
        }

        await pool.query("DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", [gameId, playerId]);
        res.json("Player kicked successfully. Email and refund (if applicable) have been sent.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 14. EDIT GAME
exports.editGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { court_name, address, date_time, skill_level, max_players, min_players, price, latitude, longitude } = req.body;
        
        // Update the game details
        const updatedGame = await pool.query(
            `UPDATE games 
             SET court_name = $1, address = $2, date_time = $3, skill_level = $4, 
                 max_players = $5, min_players = $6, price = $7, latitude = $8, longitude = $9 
             WHERE game_id = $10 AND host_id = $11 RETURNING *`,
            [court_name, address, date_time, skill_level, max_players, min_players, price, latitude, longitude, gameId, req.user.id]
        );

        // If no rows were updated, it means either the game doesn't exist or the user is not the host
        if (updatedGame.rows.length === 0) {
             return res.status(403).json("Unauthorised. Only the host can edit this game.");
        }

        // Fetch all players currently on the roster (excluding the host)
        const allPlayers = await pool.query(
            `SELECT u.email, u.username 
             FROM game_players gp JOIN users u ON gp.user_id = u.user_id 
             WHERE gp.game_id = $1 AND gp.user_id != $2`, 
            [gameId, req.user.id] 
        );

        // Notify all players about the update with the new details
        for (let player of allPlayers.rows) {
            sendUpdateEmail(
                player.email, 
                player.username, 
                court_name, 
                date_time, 
                address, 
                min_players, 
                max_players, 
                price, 
                skill_level
            );
        }
        
        res.json("Game updated successfully. Players have been notified.");
    } catch (err) {
        console.error("Edit Game Error:", err);
        res.status(500).send("Server Error");
    }
};