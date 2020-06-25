require('dotenv').config();
const express = require('express');
const router = express.Router();
const Client = require('../spartanBot').Client;
const emitter = require('../spartanBot').emitter
const { getCircularReplacer } = require('../spartanBot/utils');
const User = require('../models/user');
const bip32 = require('bip32');
const { Account, Networks, Address } = require('@oipwg/hdmw');
const auth = require('../middleware/auth');
const { Rent, getPriceBtcUsd } = require('../helpers/rentValues')


async function processUserInput(req, res) {
    let options = req.body

    // Next rental
    if(options.nextRental) {
        console.log('options.hashrate.toFixed(8)', options.hashrate.toFixed(8))
        console.log('options.Xpercent', options.Xpercent)
        console.log('options.userId', options.userId)
        
        let msg = {
            update: true,
            message: `Your next rental hashrate:  ${options.hashrate.toFixed(8)} \n` +
                     `Percent:  ${options.Xpercent}% `,
            userId: options.userId,
            autoRent: true
        }
        emitter.emit('message', JSON.stringify(msg));

        options.newRent = Rent
        return options
    }

    let { profitReinvestment, updateUnsold, dailyBudget,targetMargin, autoRent, spot, alwaysMineXPercent,
        autoTrade, morphie, supportedExchange, profile_id, Xpercent, userId, token, name } = options;

    try {
        const rent = await Rent(token, Xpercent / 100)
        let user = await User.findById(req.user.id)
        if (!user) {
            return 'Can\'t find user. setup.js line#16'
        }
        options.userName = user.userName

        let getAddress = (index, xPub, token, usedIndexes) => {
            const EXTERNAL_CHAIN = 0
            const currency = token === "RVN" ? 'raven' : token.toLowerCase()

            if (usedIndexes.length) {
                for (let i = 0; i < usedIndexes.length; i++) {
                    if (usedIndexes[i] === index) index++
                }
            }
          
            const paymentRecieverAddressGenerator = new Account(bip32.fromBase58(xPub, Networks[currency].network), Networks[currency], false)
            let usedAddresses = paymentRecieverAddressGenerator.getUsedAddresses(EXTERNAL_CHAIN)
            let address = paymentRecieverAddressGenerator.getAddress(EXTERNAL_CHAIN, index).getPublicAddress(0)

            // LEFT OFF AT FINAL CONDITIONAL 
            if (usedAddresses.length > 0) {
                getAddress(index++, xPub, currency) // Recursion until there is an address with no transactions
            }
            return { address, index }
        }


        let MinPercentFromMinHashrate = rent.MinPercentFromMinHashrate
        let paymentRecieverXPub = user.wallet[token.toLowerCase()].xPrv
        let btcxPrv = user.wallet.btc.xPrv
       
       
        // Come back to have this work without token === FLO to working with RVN also
        if (MinPercentFromMinHashrate > Xpercent / 100 && token === 'FLO') {
            let msg = {
                update: true,
                message: `Your pecent of the network ${Xpercent} changed to ${(MinPercentFromMinHashrate * 100.1).toFixed(2)}%, to ` +
                    `continute renting with ${Xpercent}% for the MiningRigRental market, change percentage and switch renting on again.`,
                userId: userId,
                Xpercent: (MinPercentFromMinHashrate * 100.1).toFixed(2),
                autoRent: false
            }
            emitter.emit('message', JSON.stringify(msg));
            return msg
        }

        // If user rents for first time with no xPub will save xPub ( paymentRecieverXPub ) to the DB
        for (let profile of user.profiles) {
            if (profile._id.toString() === profile_id) {
                profile.name = name
                profile.token = token,
                profile.autoRent.on = autoRent
                profile.autoRent.mode.alwaysMineXPercent.Xpercent = Xpercent
                profile.autoRent.mode.alwaysMineXPercent.on = alwaysMineXPercent
                profile.autoRent.mode.spot = spot
                profile.autoTrade.on = autoTrade
                profile.autoTrade.mode.morphie = morphie
                profile.autoTrade.mode.supportedExchanges = supportedExchange
                profile.targetMargin = targetMargin
                profile.profitReinvestment = profitReinvestment
                profile.updateUnsold = updateUnsold
                profile.dailyBudget = dailyBudget

                // If user doesn't have a generated address will generate a new one and save address and index to DB
                if (profile.address.publicAddress === '') {
                    let usedIndexes = user.indexes
                    let newAddress = getAddress(0, paymentRecieverXPub, token, usedIndexes)
                    let btcAddress = getAddress(0, btcxPrv, 'bitcoin', usedIndexes)

                    profile.address.publicAddress = newAddress.address
                    profile.address.btcAddress = btcAddress.address
                          
                    options.address = newAddress.address
                    let index = newAddress.index
                    user.indexes.push(index)
                    
                    break;
                } else {
                    options.address = profile.address.publicAddress
                }
            }
        }
        await user.save()

        

        options.profile_id = profile_id
        options.PriceBtcUsd = getPriceBtcUsd
        options.NetworkHashRate = rent.Networkhashrate
        options.MinPercent = rent.MinPercentFromMinHashrate
        // options.duration = token == "FLO" ? 24 : 3
        options.duration = 24
        options.newRent = Rent
        options.difficulty = rent.difficulty
        options.hashrate = rent.Rent
        options.rentType = 'Manual'
        options.type = 'FIXED',
        options.algorithm = 'SCRYPT'
        return options
    } catch (e) {
        console.log('Catch error rent.js line 140: .' + e )
        return { err: 'Catch error rent.js line 140: .' + e }
    }
}

const processData = async (req, res) => {
    try {
        // From user input this file 
        var userInput = await processUserInput(req, res).then(data => data).catch(err => err)
        console.log('processUserInput ', userInput)
        if (userInput['update']) {
            return res.status(200).json(userInput)
        }

        // Rent, setup provider, update provider
        Client.controller(userInput);
    } catch (err) {
        console.log('route rent.js catch error', err);
    } 

    // From within SpartanBot only
    emitter.once('rented', async (msg) => {
        const user = await User.findById(req.user.id).select('profiles')
        console.log('MSG', msg)
        // If data needs to be saved to Database
        if (msg.db) {
            for(let profile of user.profiles) {
                if(profile._id.toString() === req.body.profile_id) {
                    for (let key in msg) {
                        if (key === 'autoRent') {
                            profile.autoRent.on = msg[key]
                        } else if (key === 'db') {
                            for (let key in msg.db) {
                                profile[key] = Number(msg.db[key])
                            }
                        }
                    }
                }
            }
        }
        
        // Send message back to client 
        let data = JSON.stringify(msg, getCircularReplacer());
        emitter.emit('message', data);

        try {
            let timerData = msg;
            timerData.profiles = user.profiles
            timerData.profile_id = userInput.profile_id 
            timerData.duration = userInput.duration
 
            let Timer = timerData.timer
            new Timer(timerData, req, res).setTimer()

            let message = JSON.stringify(msg, getCircularReplacer())
            res.status(200).send({db: msg.db})

        } catch (err) {
            console.log('err:', err)
            let message = JSON.stringify({message: err.message, autoRent: false })
            res.write(message)
        }
        return user.save()
    })
}

/* POST settings  page */
router.post('/', auth, async (req, res) => {
    processData(req,res)
});

router.post('/nextrental', (req, res) => {
    let options = req.body
    Client.controller(options);
    console.log('options: NEXTRENTAL RENT.JS', options)
    // processData(req,res)
});

module.exports = router;