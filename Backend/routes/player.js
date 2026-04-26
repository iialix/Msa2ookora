const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player');


router.get('/players', playerController.getPlayers);

module.exports = router;