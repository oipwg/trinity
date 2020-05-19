const express = require('express');
const router = express.Router();
//! auth for testing
const auth = require('../middleware/auth')



const AutoTradeController = require('../controllers/autoTrade')



router.get('/on/:_id', auth, AutoTradeController.on)


module.exports = router