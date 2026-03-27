const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization"); 

// CORE GAME LOGIC 
router.post("/host", authorize, gameController.hostGame);
router.get("/all", gameController.getAllGames);
router.post("/join/:gameId", authorize, gameController.joinGame);

// MANAGEMENT & ADMIN CONTROLS
router.get("/mygames", authorize, gameController.getMyGames);
router.delete("/delete/:gameId", authorize, gameController.deleteGame); 
router.delete("/leave/:gameId", authorize, gameController.leaveGame);
router.delete("/kick/:gameId/:playerId", authorize, gameController.kickPlayer);
router.put("/edit/:gameId", authorize, gameController.editGame);

// FINANCIAL INTEGRATION
router.post("/checkout/:gameId", authorize, gameController.createCheckout);

// SOCIAL & LOCKER ROOM CHAT 
router.get("/players/:gameId", gameController.getGamePlayers);
router.get("/messages/:gameId", gameController.getGameMessages);
router.post("/messages/:gameId", authorize, gameController.sendMessage); 

// PEER REPUTATION SYSTEM
router.post("/rate/:gameId", authorize, gameController.rateHost);
router.get("/rating/:hostId", gameController.getHostRating);

module.exports = router;