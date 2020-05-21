require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const setupRouter = require('./routes/setup');
const settingsRouter = require('./routes/settings');
const authRouter = require('./routes/auth');
const bittrexRouter = require('./routes/bittrex');
const rentRouter = require('./routes/rent');
const userProfiles = require('./routes/userProfiles')
const passport = require('passport');
const autoTradeRouter = require('./routes/autoTrade')
const { NODE_ENV, MONGO_URL } = process.env;

const app = express();


mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .catch(error => console.log('Mongoose DB error ', error));

if(NODE_ENV === 'development'){
    app.use(logger('dev'));
}

// CORS - DEVElOPMENT ONLY - //todo: del. me
// use proxy for production
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE')
    next();
};
app.use(allowCrossDomain);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());


// Routes
app.use('/users', usersRouter);
app.use('/setup', setupRouter);
app.use('/settings', settingsRouter);
app.use('/auth', authRouter);
app.use('/bittrex', bittrexRouter);
app.use('/profile', userProfiles);
app.use('/rent', rentRouter);
app.use('/auto-trade', autoTradeRouter);

if(NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')))
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});


// BITTREX SOCKET
// const util = require('util');
// const SignalRClient = require('bittrex-signalr-client');
// let client = new SignalRClient({
//     // websocket will be automatically reconnected if server does not respond to ping after 10s
//     pingTimeout:10000,
//     // use cloud scraper to bypass Cloud Fare (default)
//     useCloudScraper:true
// });

// //-- event handlers
// client.on('ticker', function(data){
//     console.log(util.format("Got ticker update for pair '%s'", data.pair));
// });

// //-- start subscription
// console.log("=== Subscribing to 'USDT-BTC' pair");
// client.subscribeToTickers(['USDT-BTC']);

//-- event handlers
// client.on('orderBook', function(data){
//     console.log(data.data)
//     console.log(util.format("Got full order book for pair '%s' : cseq = %d", data.pair, data.cseq));
// });
// client.on('orderBookUpdate', function(data){
//     console.log(data.data)
//     console.log(util.format("Got order book update for pair '%s' : cseq = %d", data.pair, data.cseq));
// });
// client.on('trades', function(data){
//     console.log(data)
//     console.log(util.format("Got trades for pair '%s'", data.pair));
// });

// //-- start subscription
// console.log("=== Subscribing to 'BTC-FLO' pair");
// client.subscribeToMarkets(['BTC-FLO']);


// this._client = client;

// this._client.connect();

module.exports = app;
