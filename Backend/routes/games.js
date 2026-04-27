const express = require('express');
const router = express.Router();
const playerController = require('../controllers/games');

router.get('/password', playerController.getPasswordPlayers);
router.get('/bedonKalam', playerController.getBedonKalamPlayers);
router.get('/changePlayer', playerController.getAnotherPlayer);

router.get('/anaMeen', playerController.getAnaMeen);

router.get('/topTen', playerController.getTopTen);


module.exports = router;