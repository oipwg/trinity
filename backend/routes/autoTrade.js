const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth') //!


const AutoTradeController = require('../controllers/autoTrade')



router.get('/on/:_id', auth, AutoTradeController.on) //! del auth

router.post('/results', auth, AutoTradeController.results);



module.exports = router