const { Player, AnaMeen } = require('../models/games.js');


exports.getPasswordPlayers = async (req, res) => {
    try {
        const number = 8;
        const players = await Player.getPlayers(number);
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
        console.log(error);
    }
};

exports.getBedonKalamPlayers = async (req, res) => {
    try {
        const number = 10;
        const players = await Player.getPlayers(number);
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
        console.log(error);
    }
};

exports.getAnotherPlayer = async (req, res) => {
    try {
        const number = 1;
        const players = await Player.getPlayers(number);
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player' });
        console.log(error);
    }
};

exports.getAnaMeen = async (req, res) => {
    try {
        const info = await AnaMeen.getAnaMeen();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch info' });
        console.log(error);
    }
};
