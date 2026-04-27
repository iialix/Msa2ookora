const { Player, AnaMeen, TopTen, Bank, Offside } = require('../models/games.js');

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

exports.getAnaMeenInfo = async (req, res) => {
    try {
        const info = await AnaMeen.getAnaMeen();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch info' });
        console.log(error);
    }
};

exports.getTopTenQuestions = async (req, res) => {
    try {
        const info = await TopTen.getTopTen();
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch info' });
        console.log(error);
    }
};

exports.getBankQuestions = async (req, res) => {
    try {
        const questions = await Bank.getBankQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
        console.log(error);
    }
};

exports.getOffsideQuestions = async (req, res) => {
    try {
        const questions = await Offside.getOffsideQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
        console.log(error);
    }
};