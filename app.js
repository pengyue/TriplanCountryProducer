'use strict';

// Constants
const PORT = (process.env.PRODUCER_NODE_UI_LISTEN_PORT) ? process.env.PRODUCER_NODE_UI_LISTEN_PORT : 8100;
const HOST = '0.0.0.0';
const HEALTH_LIVENESS = "/health-liveness";
const HEALTH_READINESS = "/health-readiness";
const PRODUCER_COUNTRY_POST_URL = "/producer/country";

const bodyParser = require('body-parser');
const express = require('express');
var countryProducer = require('./app/lonely_planet/country_producer');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

// App
app.get('/country/producer', function (req, res) {
    res.render('index');
});

//health check
app.get(HEALTH_LIVENESS, function (req, res) {
    res.render('health/liveness')
});
app.get(HEALTH_READINESS, function (req, res) {
    res.render("health/readiness");
});

app.post(PRODUCER_COUNTRY_POST_URL, (req, res) => {
    //example calls: (after waiting for three seconds to give the producer time to initialize)
    setTimeout(function () {
        countryProducer.run();
    }, 1000);

    res.send('Start country producer job ... <br/> <a href="/">Back</a> <br/>');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

