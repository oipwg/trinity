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
    }
    return options
}

/* GET setup wizard page */
router.post('/', (req, res) => {
    const body = req.body;
    console.log('body:', body)
    console.log(processUserInput(body))

    // From the req.body
    let options = {
        rental_provider: 'MiningRigRentals',
        api_key: '7af572bacb6ffcfbe5cc5b73ddb9c27b0e8023ce0205dcdfaa116c76c9c25919',
        api_secret: 'fc613d94ac190066649e8db6323fc486b878a63143bb78f5dafa61516df991f8',
        name: 'MRR',
        to_do: {
            rentalProvider: {
                add: true,
            }
        },
        // pool: { 
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
            console.log('setup.js',data)
            const err = new Error(data);
            console.log(err.message)
            // res.status(200).send(data);
            res.status(200).json({data})
        }).catch((err)=> {
            console.log('Error :', err )
            res.json({err: err})
        } );
        
    } catch (e) {
        console.log('Setup.js error', e);
        res.status(500).json({ err: e });
    }
});

module.exports = router;
