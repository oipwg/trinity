require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const request = require('request');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
const emitter = new Emitter();
const User = require('../models/user');
const bip32 = require('bip32');
const https = require('https');
const { Account, Networks, Address } = require('@oipwg/hdmw');

const auth = require('../middleware/auth');
const wss = require('./socket').wss;
const Timer = require('../helpers/timer');

// console.log(new Timer().setTimer())

wss.on('connection', ws => {
    emitter.on('message', msg => {
        ws.send(msg);
    });
});

const getPriceBtcUsd = async () => {
    let promise = new Promise((resolve, reject)=> {
        https.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC', (response) => {
        let todo = '';

        // called when a data chunk is received.
        response.on('data', (chunk) => {
            todo += chunk;
        })

        // called when the complete response is received.
        response.on('end', () => {
            resolve(JSON.parse(todo))
        })

        }).on("error", (error) => {
            console.log("Error: " + error.message);
            reject("Error: " + error.message)
        })
    })
    return promise
}


const Rent = async (token, percent) => {
    if (token === "FLO") {
        return await new Promise((resolve, reject) => {
            https.get('https://livenet.flocha.in/api/status?q=getInfos', (response) => {
                let body = ''
                response.on('data', (chunk) => {
                    body += chunk;
                });

                response.on('end', () => {
                    let data = JSON.parse(body)
                    let difficulty = data.info.difficulty
                    let hashrate = difficulty * Math.pow(2, 32) / 40
                    let Networkhashrate = hashrate / 1000000000000;  // TH/s
                    let Rent = Networkhashrate * (-percent / (-1 + percent)) // * 1000000 for MRR to MH/s
                    let MinPercentFromMinHashrate = 1000000000000 * .01 / ((difficulty * Math.pow(2, 32) / 40) + (1000000000000 * .01))
                    resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate })
                });
                
            }).on("error", (error) => {
                console.log("Error: " + error.message);
                reject("Error: " + error.message)
            });
        })
    }

    if (token === "RVN") {
        console.log('RVN HIT')
        return await new Promise((resolve, reject) => {
            request({ url: 'https://rvn.2miners.com/api/stats' }, (err, res, body) => {
                if (err) {
                    reject(err)
                }
                let data = JSON.parse(body);
                let difficulty = data.nodes[0].difficulty;
                let hashrate = difficulty * Math.pow(2, 32) / 60;
                let Networkhashrate = hashrate / 1000000000000; // TH/s
                let Rent = Networkhashrate * (-percent / (-1 + percent))   // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ((difficulty * Math.pow(2, 32) / 60) + (1000000000000 * .01))
                resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate })
            })
        })
    }
}

async function processUserInput(req, res) {

        // let msg = {
        //     update: true,
        //     client: {dailyBudget: 0.088876.toFixed(2)},
        //     db: 'dailyBudget',
        //     dailyBudget: 0.88876.toFixed(2)
        // };
        
        // emitter.emit('rented', msg);

    

    let options = req.body
    let { profitReinvestment, updateUnsold, dailyBudget, autoRent, spot, alwaysMineXPercent,
        autoTrade, morphie, supportedExchange, profile_id, Xpercent, userId, token } = options;

    try {
        const rent = await Rent(token, Xpercent / 100)
        console.log('rent: RENT.JS 111')
        let user = await User.findById({ _id: userId })

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
            return {
                update: true,
                message: `Your pecent of the network ${Xpercent} changed to ${(MinPercentFromMinHashrate * 100.1).toFixed(2)}%, to ` +
                    `continute renting with ${Xpercent}% for the MiningRigRental market, change percentage and switch renting on again.`,
                Xpercent: (MinPercentFromMinHashrate * 100.1).toFixed(2),
                autoRent: false
            }
        }

        // If user rents for first time with no xPub will save xPub ( paymentRecieverXPub ) to the DB
        for (let profile of user.profiles) {
            if (profile._id.toString() === profile_id) {

                // If user doesn't have a generated address will generate a new one and save address and index to DB
                if (profile.address.publicAddress === '') {
                    let usedIndexes = user.indexes
                    let newAddress = getAddress(0, paymentRecieverXPub, token, usedIndexes)
                    let btcAddress = getAddress(0, btcxPrv, 'bitcoin', usedIndexes)
                    console.log('btcAddress:', btcAddress)
                    console.log('newAddress.address', newAddress.address)

                    profile.address.publicAddress = newAddress.address
                    profile.address.btcAddress = btcAddress.address

                    options.address = newAddress.address
                    let index = newAddress.index
                    user.indexes.push(index)
                     await user.save()
                    break;
                } else {
                    options.address = profile.address.publicAddress
                }
            }
        }
      
        if (!user) {
            return 'Can\'t find user. setup.js line#16'
        }

        options.to_do = {
            rent: {
                rent: true,
            }
        }
        console.log('OPTIONS ADDRESS', options.address)
        options.profile_id = profile_id
        options.PriceBtcUsd = getPriceBtcUsd
        options.NetworkHashRate = rent.Networkhashrate
        options.MinPercent = rent.MinPercentFromMinHashrate
        options.emitter = emitter
        // options.duration = token == "FLO" ? 24 : 3
        options.duration = 3
        options.newRent = Rent
        options.difficulty = rent.difficulty
        options.hashrate = rent.Rent
        options.rentType = 'Manual'
        return options
    } catch (e) {
        console.log('Catch error rent.js line 182: .' + e )
        return { err: 'Catch error rent.js line 182: .' + e }
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
        controller(userInput);
    } catch (err) {
        console.log('route rent.js catch error', err);
    } 

    // From within SpartanBot only
    emitter.once('rented', async (msg) => {
        const user = await User.findById({ _id: req.body.userId }).select('profiles')
        
        // If data needs to be saved to Database
        if (msg.db) {
            for(let profile of user.profiles) {
                if(profile._id.toString() === req.body.profile_id) {
                    for(let property in msg.db) {
                        let key = property
                        let value = msg.db[key]
                        profile[key] = Number(value)
                    }
                }
            }
        }

        // Send message back to client 
        let data = JSON.stringify(msg);
        emitter.emit('message', data);
        // console.log('MSG: ', msg)
        try {
            let timerData = msg;
            timerData.profiles = user.profiles
            timerData.profile_id = userInput.profile_id 
            timerData.duration = userInput.duration

            new Timer(timerData, req).setTimer()
            let message = JSON.stringify(msg)
            res.write(message)

        } catch (err) {
            console.log('err:', err)
            let message = JSON.stringify({message: err.message, autoRent: false })
            res.write(message)
            // res.status(500).json({message: err.message, autoRent: false } )
        }
        
        return user.save()
    })
}

/* POST settings  page */
router.post('/', auth, async (req, res) => {
    processData(req,res)
});



module.exports = router;