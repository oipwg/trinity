require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const request = require('request');
const events = require('events');
const User = require('../models/user');
const emitter = new events()
const wss = require('./socket').wss;
const bip32 = require('bip32');
const { Account, Networks, Wallet } = require('@oipwg/hdmw');
// const Wallet = HDMW.Wallet;


const Rent = async (token, percent) => {

    console.log('percent', percent)
    if (token === "FLO") {
        return await new Promise((resolve, reject) => {
            request({url: 'https://livenet.flocha.in/api/status?q=getInfos'}, (err, res, body)=> {
                if (err) {
                    reject( err )
                }
                let data = JSON.parse(body)
                let difficulty = data.info.difficulty
                let hashrate = difficulty * Math.pow(2, 32) / 40
                let Networkhashrate = hashrate / 1000000000000;  // TH/s
                let Rent = Networkhashrate * (-percent / (-1 + percent)) // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ( ( difficulty * Math.pow(2, 32) / 40 ) + (1000000000000 * .01) )
                resolve( {Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate } )
            })
        })
    }
   
    if (token === "RVN") {
        return await new Promise((resolve, reject) => {
            request({ url: 'https://rvn.2miners.com/api/stats' }, (err, res, body) => {
                if (err) {
                    reject( err ) 
                }
                let data = JSON.parse(body);
                let difficulty = data.nodes[0].difficulty;
                let hashrate = difficulty * Math.pow(2, 32) / 60;
                let Networkhashrate = hashrate / 1000000000000; // TH/s
                let Rent = Networkhashrate * (-percent / (-1 + percent))   // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ( ( difficulty * Math.pow(2, 32) / 40 ) + (1000000000000 * .01) )
                resolve( {Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate } )
            })
        })
    }
}

async function processUserInput(req, res) {
    let options = req.body
    let {profitReinvestment, updateUnsold, dailyBudget, autoRent, spot, alwaysMineXPercent,
        autoTrade, morphie, supportedExchange, Xpercent, userId, token} = options;
    // let token = options.token
    console.log('OOPTIONS', options)
    console.log('options: rent.js 41')

    let accountMaster = bip32.fromBase58("Fprv4xQSjQhWzrCVzvgkjam897LUV1AfxMuG8FBz5ouGAcbyiVcDYmqh7R2Fi22wjA56GQdmoU1AzfxsEmVnc5RfjGrWmAiqvfzmj4cCL3fJiiC", Networks.flo.network)
    let account = new Account(accountMaster, Networks.flo, false);
    let paymentRecieverXPub = account.getExtendedPublicKey()
    // const paymentRecieverAddressGenerator = new Account(bip32.fromBase58(paymentRecieverXPub, Networks.flo.network), Networks.flo, false)
    

    // Generate the first 25 addresses
    let getAddress = (index, xPub) => {
        console.log('INDEX:', index)
        const EXTERNAL_CHAIN = 0
        let address = ''
        let addressIndex = 0
        for (let i = 0; i < 25; i++) {
            if (i === index) {
                console.log('HIT TO MANY TIME')
                // Load Account from xPub
                const paymentRecieverAddressGenerator = new Account(bip32.fromBase58(xPub, Networks.flo.network), Networks.flo, false)
                address = paymentRecieverAddressGenerator.getAddress(EXTERNAL_CHAIN, i).getPublicAddress()
            }
            // console.log(`${i}: ${paymentRecieverAddressGenerator.getAddress(EXTERNAL_CHAIN, i).getPublicAddress()}`)
            
        }
        return address
    }
    


    try {
        const rent = await Rent(token, Xpercent/100)

        let MinPercentFromMinHashrate = rent.MinPercentFromMinHashrate
     
        if ( MinPercentFromMinHashrate > Xpercent/100 ) {
  
            return {
                    update: true,
                    message: `Your pecent of the network ${Xpercent} changed to ${(MinPercentFromMinHashrate*101).toFixed(2)}%, to `+
                    `continute renting with ${Xpercent}% for the MiningRigRental market, change percentage and switch renting on again.`,
                    Xpercent: (MinPercentFromMinHashrate*101).toFixed(2),
                    autoRent: false
                }
        }

        const user = await User.findById({ _id: userId });
        console.log('user:', user)
        // If user rents for first time with no xPub will save xPub ( paymentRecieverXPub ) to the DB
        if (user.xPub === '') {
            user.xPub = paymentRecieverXPub
        }
        
        for( let profile of user.profiles ) {
            // If user doesn't have a generated address will generate a new one and save address and index to DB
            if ( profile.poolAddress.address === '') {
 
                let newAddress = getAddress(0, paymentRecieverXPub)
                profile.poolAddress.address = newAddress
                profile.poolAddress.index = 0
                break;
            } 
            // If address already exist in database check next index and save address and index to DB
            if ( profile.poolAddress.address !== '') {
                let currentIndex = profile.poolAddress.index
                let nextAddress = getAddress(++currentIndex, paymentRecieverXPub)

                profile.poolAddress.address = nextAddress
                profile.poolAddress.index = currentIndex

            }
        }

        user.save()
        if (!user) {
            return 'Can\'t find user. setup.js line#16'
        }
        
        options.to_do = {
            rent: {
                rent: true,
            }
        }
        options.NetworkHashRate = rent.Networkhashrate
        options.MinPercent = rent.MinPercentFromMinHashrate
        options.emitter = emitter
        options.duration = token === "FLO" ? 24 : 3
        options.newRent = Rent
        options.difficulty = rent.difficulty
        options.hashrate = rent.Rent
        options.rentType = 'Manual' 
        options.address = "somelongaddress3456"
        return options
    } catch (e) {
        return {err: 'Can\'t find user or input is wrong.'+ e}
    }
}

/* POST settings  page */
router.post('/',  async (req, res) => {
 
    let userInput = await processUserInput(req, res).then(data => data).catch(err => err)
    console.log('processUserInput ', userInput)

    // Any data that has been updated, it updates the user to proceed again
    if (userInput['update']) {
        return res.json(userInput)
    }
   
    try {
        let data = await controller(userInput);
        console.log('data: rent.js route', data)
        res.status(200).json({data: data, fromRent: data})

    } catch (err) {
        console.log('route rent.js line #129 catch error', err);
        res.status(500).json({err: err})
    }
});

module.exports = router;