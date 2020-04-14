require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('../spartanBot');
const request = require('request');

const NetworkHhshrateFlo = () => {
    request({url: 'https://livenet.flocha.in/api/status?q=getInfos'}, (err, res, body)=> {
        let data = JSON.parse(body)
        let blocks = data.info.difficulty
        let hashrate = blocks * Math.pow(2, 32) / 40
        let hashrateTH = hashrate / 1000000000000
        return  hashrateTH
    })
}
console.log(NetworkHhshrateFlo())
async function processUserInput(req, res) {
    let options = req.body
    console.log('options: rent.js 11', options)
   
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