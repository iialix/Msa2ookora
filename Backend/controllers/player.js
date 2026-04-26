const Player = require('../models/players.js');

exports.getPlayers = async (req, res) => {
    try {
        const number = parseInt(req.query.number) || 10;
        const [players] = await Player.getPlayers(number);
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
        console.log(error);
    }
};