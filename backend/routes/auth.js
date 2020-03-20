require('dotenv').config();
const JWT = require('jsonwebtoken');
const {
    JWT_SECRET,
    COINBASE_CLIENT_ID,
    COINBASE_CLIENT_SECRET,
    COINBASE_REDIRECT_URL,
} = process.env;
const express = require('express');
const router = express.Router();
const passportConf = require('../passport');
const auth = require('../middleware/auth');
const User = require('../models/user');
const axios = require('axios');
const passport = require('passport');
const passportCoinbase = passport.authenticate('oauth2', { session: false });



let scopes = `wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:payment-methods:read,wallet:buys:read,wallet:buys:create,wallet:transactions:read,wallet:transactions:send,wallet:sells:create,wallet:withdrawals:create`
let meta =  `meta[send_limit_amount]=1&meta[send_limit_currency]=USD&meta[send_limit_period]=day`
let coinbaseURL = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${COINBASE_CLIENT_ID}&redirect_uri=${COINBASE_REDIRECT_URL}&state=state&scope=${scopes}&${meta}`

router.get('/coinbase', ((req, res) => 
    {
        return res.redirect((coinbaseURL))
    }
))

// pass code - will spit out token
router.get('/coinbase/callback', auth, passportCoinbase, async (req, res) => {
    try {
        console.log(req);

        return res.status(201).send({ success: req.user.coinbase.accessToken });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
