const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const playerRoutes = require('./routes/games');
const { testConnection: testDatabaseConnection } = require('./util/database');
const { testConnection: testApiConnection } = require('./util/BSD_API');

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
        await Promise.all([testDatabaseConnection(), testApiConnection()]);
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Health check failed' });
    }
});

app.use(playerRoutes);

Promise.all([testDatabaseConnection(), testApiConnection()])
    .then(() => {
        console.log('Supabase connection OK');
        console.log('BSD API connection OK');
        app.listen(8080, () => console.log('Server running on port 8080'));
    })
    .catch((error) => {
        console.error('Startup connection failed:', error.message || error);
        process.exit(1);
    });
