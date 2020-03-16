require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const usersRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');
const setupRouter = require('./routes/setup');
const setupWebSocket = require('./routes/socket');

const app = express();

const { NODE_ENV, MONGO_URL } = process.env;

mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .catch(error => console.log('Mongoose DB error ', error));

app.use(logger('dev'));

// CORS - DEVElOPMENT ONLY - //todo: del. me
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
};
app.use(allowCrossDomain);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('../public'));

// Routes
app.use('/users', usersRouter);
app.use('/dashboard', dashboardRouter);
app.use('/setup', setupRouter);
// app.use('/setup', setupWebSocket);

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

module.exports = app;
