require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const http = require('http');
const User = require('../models/user');


async function processUserInput(req, res) {
    let options = req.body
   
    let { userId, rental_provider } = options
    console.log('userId:', userId)
    try {
        const user = await User.findById({ _id: userId });
        if (!user) {
            return 'Can\'t find user. setup.js line#16'
        }
        options.to_do = {
            rentalProvider: {
                add: true,
            }
        }

        // Checks the database if user providerData exist for either niceHash or MiningRigRentals,
        // if it does get data so api and secret can be used. If not return false and add keys and secret
        // to database
        let isRentalProvider = rental_provider => {
            console.log('rental_provider:', rental_provider)
            for (let provider of user.providerData) {
                if (provider.rental_provider === rental_provider) {
                    return provider
                }
            }
        }
        let newProvider = { rental_provider, api_key: options.api_key, api_secret: options.api_secret, api_id: options.api_id }

        // When adding credentials for the first time
        if (!user.providerData.length) {
            user.providerData.push( newProvider )
            user.save()
        } else {  
            let provider = isRentalProvider(rental_provider)
            // When Credentials fields don't exist get key and secret from database
            if (provider) {
                options.api_key = provider.api_key
                options.api_secret = provider.api_secret
                options.api_id = provider.api_id
            } else {
                user.providerData.push( newProvider )
                user.save()
            }
        }
        return options
    } catch (e) {
        return {err: 'Can\'t find user or input is wrong.'+ e}
    }
}

/* GET setup wizard page */
router.post('/', async (req, res) => {
    let userInput = await processUserInput(req, res).then(data => data).catch(err => err)
    console.log('processUserInput ', userInput)


    controller(userInput).then((data)=>{
        // console.log('setup.js return data',data)
        // const err = new Error(data);
        res.status(200).json({data})
    }).catch((err)=> {
        console.log('Setup.js catch error', err);
        console.log('Error :', err )
        res.status(500).json({err: err})
    });

});

module.exports = router;
