/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const { NODE_ENV } = require('./config');
const MOVIES = require('./store');

const app = express();

const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

/* Authentication handler */
app.use(function validateBearer(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authVal = req.get('Authorization') || '';

    if (!authVal || authVal.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(400).json({error: 'Authorization token not found'});
    }
    // move to the next middleware
    next();
});

app.get('/', (req, res) => {
    res.send('Hello Express!');
});

app.get('/movie', (req, res) => {
    let apps = MOVIES;
    const {genre, country, avg_vote} = req.query;

    if (genre) {
        apps = apps.filter(app => app.genre.toLowerCase().includes(genre.toLowerCase()));
    } 

    if (country) {
        apps = apps.filter(app => app.country.toLowerCase().includes(country.toLowerCase()));
    } 

    if (avg_vote) {
        apps = apps.filter(app => app.avg_vote >= avg_vote);
    }
    
    res.json(apps);
});

/* Error handler middleware */
app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    } else {
        response = { error };
    }
    res.status(500).json(response);
});


module.exports = app;