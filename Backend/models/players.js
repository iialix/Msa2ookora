
const db = require('../util/database');

module.exports = class Player {
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

