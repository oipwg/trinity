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

router.get('/coinbase', passportCoinbase);

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
