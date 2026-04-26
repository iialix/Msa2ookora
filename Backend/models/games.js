
const db = require('../util/database');

class Player {
    constructor(name, imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }

    static findById(id) {
        return db.execute('SELECT * FROM players WHERE id = ?', [id]);
    }

    static getPlayers(number) {
        return db.execute(`SELECT * FROM players ORDER BY RAND() LIMIT ${number}`);
    }
    
    
}

class AnaMeen {
    constructor(clue1, clue2, clue3, clue4, clue5, answer) {
        this.clue1 = clue1;
        this.clue2 = clue2;
        this.clue3 = clue3;
        this.clue5 = clue5;
        this.clue4 = clue4;
        this.answer = answer;
    }   

    static getAnaMeen() {
        return db.execute(`SELECT am.clue1, am.clue2, am.clue3, am.clue4, am.clue5 ,p.name FROM Ana_meen am, players p where am.answer = p.id ORDER BY RAND() LIMIT 3`);
    }
}

module.exports = { Player, AnaMeen };