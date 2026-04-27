
const { supabase } = require('../util/database');

class Player {
    constructor(name, imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }

    static async findById(id) {
        const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

static async getPlayers(number) {
    const { data, error } = await supabase
        .rpc('get_random_players', { limit_count: number });

    if (error) throw error;
    return data;
}
}

class AnaMeen {
    constructor(clue1, clue2, clue3, clue4, clue5, answer) {
        this.clue1 = clue1;
        this.clue2 = clue2;
        this.clue3 = clue3;
        this.clue4 = clue4;
        this.clue5 = clue5;
        this.answer = answer;
    }

    static async getAnaMeen() {
    const { data, error } = await supabase
        .rpc('get_random_ana_meen', { limit_count: 3 });

        if (error) throw error;
        if (!data) return [];

        const ids = data.map((item) => item.answer).filter(Boolean);
        if (ids.length === 0) {
            return data.map((item) => ({
                clue1: item.clue1,
                clue2: item.clue2,
                clue3: item.clue3,
                clue4: item.clue4,
                clue5: item.clue5,
                name: null,
            }));
        }

        const { data: players, error: playerError } = await supabase
            .from('players')
            .select('id, name') 
            .in('id', ids);

        if (playerError) throw playerError;

        const nameMap = new Map(players.map((player) => [player.id, player.name]));

        return data.map((item) => ({
            clue1: item.clue1,
            clue2: item.clue2,
            clue3: item.clue3,
            clue4: item.clue4,
            clue5: item.clue5,
            name: nameMap.get(item.answer) || null,
        }));
    }
}

class TopTen {
    constructor(question, answer1, answer2, answer3, answer4, answer5, answer6, answer7, answer8, answer9, answer10) {
        this.question = question;
        this.answer1 = answer1;
        this.answer2 = answer2;
        this.answer3 = answer3;
        this.answer4 = answer4;
        this.answer5 = answer5;
        this.answer6 = answer6;
        this.answer7 = answer7;
        this.answer8 = answer8;
        this.answer9 = answer9;
        this.answer10 = answer10;
    }

    static async getTopTen() {
    const { data, error } = await supabase
        .rpc('get_random_top_ten', { limit_count: 3 });

        if (error) throw error;
        if (!data) return [];

        return data;
    }
}


module.exports = { Player, AnaMeen, TopTen };