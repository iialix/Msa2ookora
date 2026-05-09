const BASE_URL = 'https://sports.bzzoiro.com/api';
const API_KEY = process.env.BSD_API_KEY || '56a5f056f17f70fafd3a18d0d050a3abbd51af44';

async function bsdFetch(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Authorization': `Token ${API_KEY}`,
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) {
        throw new Error(`BSD API error ${res.status}: ${path}`);
    }

    return res.json();
}

async function testConnection() {
    const data = await bsdFetch('/players/?search=mohamed salah');
    // console.log('BSD API test response:', data);
    if (!data.results) throw new Error('Unexpected response from BSD API');
    return true;
}

module.exports = { bsdFetch, testConnection };