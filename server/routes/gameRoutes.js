const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization"); // Or verifyToken, depending on your file name

// 🏀 SPRINT 1-3: Core Game Logic
router.post("/host", authorize, gameController.hostGame);
router.get("/all", gameController.getAllGames);
router.post("/join/:gameId", authorize, gameController.joinGame);

// 🏀 SPRINT 4 & 9: Management & Admin Controls
router.get("/mygames", authorize, gameController.getMyGames);
router.delete("/delete/:gameId", authorize, gameController.deleteGame); // 🚀 Sprint 9: Admin/Host Delete
router.delete("/leave/:gameId", authorize, gameController.leaveGame);

// 🏀 SPRINT 5: Stripe Checkout
router.post("/checkout/:gameId", authorize, gameController.createCheckout);

// 🏀 SPRINT 6 & 8: Social, Locker Room Chat & Players
router.get("/players/:gameId", gameController.getGamePlayers);
router.get("/messages/:gameId", gameController.getGameMessages);
router.post("/messages/:gameId", authorize, gameController.sendMessage); 

// 🏀 SPRINT 7: Peer Rating System
router.post("/rate/:gameId", authorize, gameController.rateHost);
router.get("/rating/:hostId", gameController.getHostRating);

module.exports = router;