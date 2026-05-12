function discreteWeighted(total, weightsObj) {
    const keys = Object.keys(weightsObj);
    const weights = Object.values(weightsObj);

    const result = new Array(weights.length).fill(0);

    for (let i = 0; i < total; i++) {
        const sum = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;

        for (let j = 0; j < weights.length; j++) {
            if (r < weights[j]) {
                result[j]++;
                break;
            }
            r -= weights[j];
        }
    }

    const output = {};
    keys.forEach((key, i) => {
        output[key] = result[i];
    });

    return output;
}

function getRandomElements(arr, k) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k);
}

function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

module.exports = { discreteWeighted, getRandomElements, shuffle };

