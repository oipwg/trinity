const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');

// controller({ input: 'rent' });
// 1st get rental provider: MiningRigRentals or NiceHash
// run 2nd keys has to be updated: key and secret
//choices: ['Manual', 'Spot', 'Tradebot', 'Collective Defense', exit]

/* GET dashboard */
router.get('/', function(req, res) {
    res.render('index.html');
});

module.exports = router;
