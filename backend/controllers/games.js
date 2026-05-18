const { exp } = require('three/tsl');
const { Player, AnaMeen, TopTen, Bank, Offside, FiveXTen, Risk, InfinityXO, XO } = require('../models/games.js');

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

exports.getFiveXTenQuestions = async (req, res) => {
    try {
        const questions = await FiveXTen.getFiveXTenQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
        console.log(error);
    }
};

exports.getRiskQuestions = async (req, res) => {
    try {
        const questions = await Risk.getRiskQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
        console.log(error);
    }
};

exports.getInfiniyXOQuestions = async (req, res) => {
    try {
        const questions = await InfinityXO.getInfinityXOQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
        console.log(error);
    }
};


exports.getXOCategories = async (req, res) => {
    try {
        const { shuffledcolumns, shuffledrows } = await XO.getXOCategories(9,9);
        
        const round1Columns = shuffledcolumns.slice(0, 3);
        const round2Columns = shuffledcolumns.slice(3, 6);
        const round3Columns = shuffledcolumns.slice(6, 9);

        const round1Rows = shuffledrows.slice(0, 3);
        const round2Rows = shuffledrows.slice(3, 6);
        const round3Rows = shuffledrows.slice(6, 9);

        const rounds = {
            round1: {
                columns: round1Columns,
                rows: round1Rows
            },
            round2: {
                columns: round2Columns,
                rows: round2Rows
            },
            round3: {
                columns: round3Columns,
                rows: round3Rows
            }
        };
        
        res.status(200).json({ round1: rounds.round1, round2: rounds.round2, round3: rounds.round3 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
        console.log(error);
    }
};

exports.getXORow = async (req, res) => {
    try {
        const { shuffledcolumns, shuffledrows } = await XO.getXOCategories(0,1);
        res.status(200).json({Row: shuffledrows});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category row' });
        console.log(error);
    }
};
exports.getXOColumn = async (req, res) => {
    try {
        const { shuffledcolumns, shuffledrows } = await XO.getXOCategories(1,0);
        res.status(200).json({Column: shuffledcolumns});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category column' });
        console.log(error);
    }
};
exports.getConnectFour = async (req, res) => {
    try {
        const { shuffledcolumns, shuffledrows } = await XO.getXOCategories(7,6);
        res.status(200).json({Columns: shuffledcolumns,rows:shuffledrows});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category column' });
        console.log(error);
    }
};
