const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization");

router.post("/host", authorize, gameController.hostGame);
router.get("/all", gameController.getAllGames);
router.post("/join/:gameId", authorize, gameController.joinGame);

// Sprint 4
router.get("/mygames", authorize, gameController.getMyGames);
router.delete("/delete/:gameId", authorize, gameController.deleteGame);
router.delete("/leave/:gameId", authorize, gameController.leaveGame);

// Sprint 5 (Stripe Checkout)
router.post("/checkout/:gameId", authorize, gameController.createCheckout);

// Sprint 6 (Social & Chat Lobby)
router.get("/players/:gameId", gameController.getGamePlayers);
router.get("/messages/:gameId", gameController.getGameMessages);
router.post("/messages/:gameId", authorize, gameController.sendMessage); // Protected with authorize!

// SPRINT 6.5: Peer Rating System
router.post("/rate/:gameId", authorize, gameController.rateHost);
router.get("/rating/:hostId", gameController.getHostRating);

module.exports = router;