require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const http = require('http');

function processUserInput(body) {
    let options = body

    console.log('options:', options)
    // When adding credentials
    if (options.key) {
        options.to_do = {
            rentalProvider: {
                add: true,
            }
        }
        if ( options.rental_provider === "MiningRigRentals" ) {
            options.name = "Mining Rig Rentals"
        } else if ( options.rental_provider === "niceHash" ) {
            options.name = "Nice Hash"
        }
    }else {
        // get user option key and secret from database
    }
    return options
}



/* GET setup wizard page */
router.post('/', (req, res) => {

    const body = req.body;
    // console.log('body:', body)
    console.log(processUserInput(body))

    // From the req.body
    let options = {
        rental_provider: 'MiningRigRentals',
        api_key: process.env.MRR_API_KEY,
        api_secret: process.env.MRR_API_SECRET,
        name: 'MRR',
        to_do: {
            rentalProvider: {
                add: true,
            }
        },
        // poolData: { 
        //     profileName: 'mlg',
        //     algo: 'scrypt',
        //     host: '35.224.24.139',
        //     port: '7315',
        //     user: 'FAZ9ietwKWrufFR7F3F1r617GHQJLBcBKa',
        //     priority: '0',
        //     pass: 'x',
        //     notes: 'nothing ' 
        // }
    };
    try {
        controller(options).then((data)=>{
            console.log('setup.js return data',data)
            const err = new Error(data);
            // res.status(200).send(data);
            res.status(200).json({data})
        }).catch((err)=> {
            console.log('Error :', err )
            res.json({err: err})
        } );
        
    } catch (e) {
        console.log('Setup.js catch error', e);
        res.status(500).json({ err: e });
    }
});

module.exports = router;
