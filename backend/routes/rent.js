require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const request = require('request');

const NetworkHhshrateFlo = async () => {
    return await new Promise((resolve, reject) => {
        request({url: 'https://livenet.flocha.in/api/status?q=getInfos'}, (err, res, body)=> {
            if (err) {
                reject( err )
            }
            let data = JSON.parse(body)
            let blocks = data.info.difficulty
            let hashrate = blocks * Math.pow(2, 32) / 40
            let hashrateTH = hashrate / 1000000000000
            resolve( hashrateTH )
        })
    })
}
const NetworkHhshrateRvn = async () => {
    return await new Promise((resolve, reject) => {
        request({ url: 'https://rvn.2miners.com/api/stats' }, (err, res, body) => {
            if (err) {
                reject( err ) 
            }
            let data = JSON.parse(body);
            let blocks = data.nodes[0].difficulty;
            let hashrate = blocks * Math.pow(2, 32) / 40;
            let hashrateTH = hashrate / 1000000000000;
        
            resolve(hashrateTH);
        })
    })
}
async function processUserInput(req, res) {
    let networkHhshrateFlo = await NetworkHhshrateFlo()
    // let networkHhshrateRvn = await NetworkHhshrateRvn()

    let options = req.body
    console.log('options: rent.js 41', options)
    options.duration = 3
    options.hashrate = networkHhshrateFlo
    options.percent = 
    // let { userId, rental_provider } = options

    // try {
    //     const user = await User.findById({ _id: userId });
    //     if (!user) {
    //         return 'Can\'t find user. setup.js line#16'
    //     }
        options.to_do = {
            rent: {
                rent: true,
            }
        }
        options.rentType = 'Manual' 
        return options
    // } catch (e) {
    //     return {err: 'Can\'t find user or input is wrong.'+ e}
    // }
}

/* POST settings  page */
router.post('/',  async (req, res) => {
    let userInput = await processUserInput(req, res).then(data => data).catch(err => err)
    console.log('processUserInput ', userInput)
    return
    try {
        let data = await controller(userInput);
        console.log('data:', data)
        res.status(200).json({data: 'from rent.js'})
    } catch (err) {
        console.log('route rent.js 69 catch error', err);
        res.status(500).json({err: err})
    }
});

module.exports = router;