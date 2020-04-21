require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const request = require('request');
const events = require('events');
const User = require('../models/user');

const emitter = new events()
const wss = require('./socket').wss;


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
                let NetworkhashrateFlo = hashrate / 1000000000000;  // TH/s
                let Rent = NetworkhashrateFlo * (-percent / (-1 + percent)) // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ( ( difficulty * Math.pow(2, 32) / 40 ) + (1000000000000 * .01) )
                resolve( {Rent, MinPercentFromMinHashrate, difficulty } )
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
                let NetworkhashrateRvn = hashrate / 1000000000000; // TH/s
                let Rent = NetworkhashrateRvn * (-percent / (-1 + percent))   // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ( ( difficulty * Math.pow(2, 32) / 40 ) + (1000000000000 * .01) )
                resolve( {Rent, MinPercentFromMinHashrate, difficulty } );
            })
        })
    }
}

async function processUserInput(req, res) {
    let options = req.body
    let {profitReinvestment, updateUnsold, dailyBudget, autoRent, spot, alwaysMineXPercent,
        autoTrade, morphie, supportedExchange, Xpercent, userId, token} = options;
    // let token = options.token

    console.log('options: rent.js 41')
    
    try {
        const rent = await Rent(token, Xpercent/100)
        let MinPercentFromMinHashrate = rent.MinPercentFromMinHashrate

        if ( MinPercentFromMinHashrate > Xpercent/100 ) {
            return {info: `Need to increase your pecent of ${Xpercent} to at least ${MinPercentFromMinHashrate*100}, or 
                        we can continute renting with ${Xpercent} for the MiningRigRental market.` }
        }

        // const user = await User.findById({ _id: userId });
        
        // if (!user) {
        //     return 'Can\'t find user. setup.js line#16'
        // }
        options.to_do = {
            rent: {
                rent: true,
            }
        }
        options.emitter = emitter
        options.duration = 3
        options.newRent = Rent
        options.difficulty = rent.difficulty
        options.hashrate = rent.Rent
        options.rentType = 'Manual' 
        return options
    } catch (e) {
        return {err: 'Can\'t find user or input is wrong.'+ e}
    }
}

/* POST settings  page */
router.post('/',  async (req, res) => {
  
   
    // emitter.on('info', (data)=> {
    //     console.log('data rent.js emitter', data)
    //     // res.write({data: data})
    //     let json = JSON.stringify({from: 'emiter'})
    //     res.write(json)
    //     writtenWrite++
    //     if(writtenWrite === 2) {
    //         res.end()
    //     }
        
    // })  
    let userInput = await processUserInput(req, res).then(data => data).catch(err => err)
    console.log('processUserInput ', userInput)
    if (userInput['err']) {
        return res.json(userInput)
    }
   
    
    try {
        let data = await controller(userInput);
        console.log('data: rent.js route', data)
        res.status(200).json({data: data, fromRent: data})
        let json = JSON.stringify({hey: 'you'})
    } catch (err) {
        console.log('route rent.js 69 catch error', err);
        res.status(500).json({err: err})
    }
});

module.exports = router;