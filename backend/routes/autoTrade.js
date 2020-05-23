const express = require('express');
const router = express.Router();



const AutoTradeController = require('../controllers/autoTrade')



router.get('/on/:_id', AutoTradeController.on)


module.exports = router