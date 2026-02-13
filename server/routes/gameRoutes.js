const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization"); // Ensure user is logged in

// POST http://localhost:5000/games/host
router.post("/host", authorize, gameController.hostGame);

// GET http://localhost:5000/games/all
router.get("/all", gameController.getAllGames);

module.exports = router;