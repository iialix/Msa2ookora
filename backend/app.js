const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const playerRoutes = require('./routes/games');
const { testConnection } = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/health', async (req, res) => {
    try {
        await testConnection();
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Supabase health check failed' });
    }
});

app.use(playerRoutes);

testConnection()
    .then(() => console.log('Supabase connection OK'))
    .catch((error) => console.error('Supabase connection failed:', error.message || error));

app.listen(8080);
