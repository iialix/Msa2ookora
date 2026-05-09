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

router.get('/risk', playerController.getRiskQuestions);

router.get('/infinityXO', playerController.getInfiniyXOQuestions);

router.get('/xo', playerController.getXOCategories);

/*
    9 rows
    9 columns

    
    + -> 9
    + -> 9 

    2, 3, 3, 1

    random

*/

module.exports = router;