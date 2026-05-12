
const { supabase } = require('../util/database');
const helper = require('../util/helperFunctions');

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

class Bank {
    constructor(question, answer) {
        this.question = question;
        this.answer = answer;
    }

    static async getBankQuestions() {
        const { data, error } = await supabase
            .rpc('get_random_bank', { limit_count: 72 });

        if (error) throw error;
        if (!data) return [];

        return data;
    }

}

class Offside {
    constructor(question) {
        this.question = question;
    }

    static async getOffsideQuestions() {
        const { data, error } = await supabase
            .rpc('get_random_offside', { limit_count: 10 });

        if (error) throw error;
        if (!data) return [];

        return data;
    }
}

class FiveXTen {
    constructor(question) {
        this.question = question;
    }

    static async getFiveXTenQuestions() {
        const { data, error } = await supabase
            .rpc('get_random_5x10', { limit_count: 8 });

        if (error) throw error;
        if (!data) return [];

        return data;
    }
}


class Risk {
    constructor(category,question,answer,difficulty,choices) {
        this.category = category; 
        this.question = question;
        this.answer = answer;
        this.difficulty = difficulty;
        this.choices = choices;
    }

    static async getRiskQuestions() {
        const { data, error } = await supabase
            .rpc('get_random_risk');

        if (error) throw error;
        if (!data) return [];

        const ids = data.map((item) => item.category_id).filter(Boolean);
        if (ids.length === 0) {
            return data.map((item) => ({
                category: null,
            }));
        }

        const { data: categories, error: categoryError } = await supabase
            .from('categories')
            .select('id, category')
            .in('id', ids);

        if (categoryError) throw categoryError;

        const categoryMap = new Map(categories.map((category) => [category.id, category.category]));

        return data.map((item) => ({
            question: item.question,
            category: categoryMap.get(item.category_id) || null,
            answer: item.answer,
            difficulty: item.difficulty,
            choices: JSON.parse(item.choices)
        }));
    }
}

class InfinityXO {
    constructor(question, answer) {
        this.question = question;
        this.answer = ansewr;
        this.choices = choices;
    }

    static async getInfinityXOQuestions() {
        const { data, error } = await supabase
            .rpc('get_random_infinityxo', { limit_count: 45 });

        if (error) throw error;
        if (!data) return [];

        const parsedData = data.map(q => ({
            ...q,
            choices: JSON.parse(q.choices)
        }));

        return parsedData;
    }
}

class XO {
    constructor(categories1, categories2) {
        this.categories1 = categories1;
        this.categories2 = categories2;
    }

static async getXOCategories() {
    const category1RandomNumbers = helper.discreteWeighted(9, {
        countries: 1.5,
        championships: 1.5,
        clubs: 1.5,
        coaches: 1
    });

    const category2RandomNumbers = helper.discreteWeighted(9, {
        clubs: 2,
        coaches: 0.5,
        positions: 1
    });

    const positions = ["ST","RW","LW","CM","CDM","CAM","CB","LB","RB","GK"];

        const [countries, championships, clubs, coaches] = await Promise.all([
            supabase.rpc('get_random_countries', { limit_count: category1RandomNumbers.countries }),
            supabase.rpc('get_random_championships', { limit_count: category1RandomNumbers.championships }),
            supabase.rpc('get_random_clubs', { limit_count: category1RandomNumbers.clubs + category2RandomNumbers.clubs }),
            supabase.rpc('get_random_coaches', { limit_count: category1RandomNumbers.coaches + category2RandomNumbers.coaches })
        ]);

        if (countries.error) throw countries.error;
        if (championships.error) throw championships.error;
        if (clubs.error) throw clubs.error;
        if (coaches.error) throw coaches.error;
        

        const columns = [
            ...(countries.data || []),
            ...(championships.data || []),
            ...(clubs.data || []).slice(0, category1RandomNumbers.clubs),
            ...(coaches.data || []).slice(0, category1RandomNumbers.coaches)
        ];

        const rows = [
            ...(clubs.data || []).slice(category1RandomNumbers.clubs),
            ...(coaches.data || []).slice(category1RandomNumbers.coaches),
            ...helper.getRandomElements(positions, category2RandomNumbers.positions)
        ];

        const shuffledCategory1 = helper.shuffle(columns);
        const shuffledCategory2 = helper.shuffle(rows);

        return { columns: shuffledCategory1, rows: shuffledCategory2 };
    }
    static async getXOCategoryColumn() {
        const category = helper.discreteWeighted(1, {
            countries: 1.5,
            championships: 1.5,
            clubs: 1.5,
            coaches: 1
        });

        const selectedCategory = Object.keys(category).find((key) => category[key] === 1);
        if (!selectedCategory) return null;

        const rpcMap = {
            countries: 'get_random_countries',
            championships: 'get_random_championships',
            clubs: 'get_random_clubs',
            coaches: 'get_random_coaches'
        };

        const rpcName = rpcMap[selectedCategory];
        if (!rpcName) return null;

        const { data, error } = await supabase.rpc(rpcName, { limit_count: 1 });
        if (error) throw error;
        return data;
    }

    static async getXOCategoryRow() {
        const category = helper.discreteWeighted(1, {
            clubs: 2,
            coaches: 0.5,
            positions: 1
        });

        const selectedCategory = Object.keys(category).find((key) => category[key] === 1);
        if (!selectedCategory) return null;

        const positions = ["ST","RW","LW","CM","CDM","CAM","CB","LB","RB","GK"];

        if (selectedCategory === 'positions') {
            return helper.getRandomElements(positions, 1)[0] || null;
        }

        const rpcMap = {
            clubs: 'get_random_clubs',
            coaches: 'get_random_coaches'
        };

        const rpcName = rpcMap[selectedCategory];
        if (!rpcName) return null;

        const { data, error } = await supabase.rpc(rpcName, { limit_count: 1 });
        if (error) throw error;
        return data;
    }
}

module.exports = { Player, AnaMeen, TopTen, Bank, Offside, FiveXTen, Risk, InfinityXO, XO };