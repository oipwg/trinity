require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
console.log(controller);
// controller(options);
// 1st get rental provider: MiningRigRentals or NiceHash
// run 2nd keys has to be updated: key and secret
//choices: ['Manual', 'Spot', 'Tradebot', 'Collective Defense', exit]

/* GET setup wizard page */
router.get('/', (req, res) => {
    // From the req.body
    let options = {
        rental_provider: 'MiningRigRentals', // or 'NiceHash'
        api_key: process.env.MRR_API_KEY, // come from the body instead
        api_secret: process.env.MRR_API_SECRET, // come from the body instead
        name: 'MRR',
        to_do: 'add',
    };
    controller(options);
    res.render('index.html');
});

module.exports = router;
