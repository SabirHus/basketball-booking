const router = require("express").Router();
const gameController = require("../controllers/gameController");
const authorize = require("../middleware/authorization");

router.post("/host", authorize, gameController.hostGame);
router.get("/all", gameController.getAllGames);
router.post("/join/:gameId", authorize, gameController.joinGame);

router.get("/mygames", authorize, gameController.getMyGames);
router.delete("/delete/:gameId", authorize, gameController.deleteGame);
router.delete("/leave/:gameId", authorize, gameController.leaveGame);

module.exports = router;