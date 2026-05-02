const express = require('express');
const router = express.Router();
const playerController = require('../controllers/games');

router.get('/password', playerController.getPasswordPlayers);
router.get('/bedonKalam', playerController.getBedonKalamPlayers);
router.get('/changePlayer', playerController.getAnotherPlayer);

router.get('/anaMeen', playerController.getAnaMeenInfo);

router.get('/topTen', playerController.getTopTenQuestions);

router.get('/bank', playerController.getBankQuestions);

router.get('/offside', playerController.getOffsideQuestions);

router.get('/fiveXten', playerController.getFiveXTenQuestions);


module.exports = router;