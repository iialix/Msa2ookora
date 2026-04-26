const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const playerRoutes = require('./routes/player');
const db = require('./util/database');

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

app.use(playerRoutes);

app.listen(8080);
