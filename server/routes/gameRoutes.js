const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization");

// POST http://localhost:5000/games/host
router.post("/host", authorize, gameController.hostGame);

// POST http://localhost:5000/games/join/5  <-- NEW ROUTE
router.post("/join/:gameId", authorize, gameController.joinGame);

// GET http://localhost:5000/games/all
router.get("/all", gameController.getAllGames);

module.exports = router;