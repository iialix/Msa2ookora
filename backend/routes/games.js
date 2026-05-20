const express = require('express');
const router = express.Router();
const playerController = require('../controllers/games');

router.get('/password', playerController.getPasswordPlayers);
router.get('/bedonKalam', playerController.getBedonKalamPlayers);
router.get('/changePlayer', playerController.getAnotherPlayer);
router.get('/allPlayers', playerController.getAllPlayers);

router.get('/anaMeen', playerController.getAnaMeenInfo);

router.get('/topTen', playerController.getTopTenQuestions);

router.get('/bank', playerController.getBankQuestions);

router.get('/offside', playerController.getOffsideQuestions);

router.get('/fiveXten', playerController.getFiveXTenQuestions);

router.get('/risk', playerController.getRiskQuestions);

router.get('/infinityXO', playerController.getInfiniyXOQuestions);

router.get('/xo', playerController.getXOCategories);

router.get('/changeXOColumn', playerController.getXOColumn);

router.get('/changeXORow', playerController.getXORow);

router.get('/changeXORound', playerController.getXORound);

router.get('/connectFour', playerController.getConnectFour);

module.exports = router;