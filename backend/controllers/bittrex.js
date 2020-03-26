const axios = require('axios');
const Crypto = require('crypto')
const nonce = `76932509675239680235`
const User = require('../models/user')

const bittrex = axios.create({
    baseURL: `https://api.bittrex.com/api/v1.1`,
    timeout: 2000,

})


module.exports = {
    exchangeRate: async(req, res ) => {
        try {

            let exchangeRate = {
                flo: null,
                rvn: null,
            }

          const responseFLO = await  bittrex
                .get(`/public/getticker?market=BTC-FLO`)
          const responseRVN = await  bittrex
                .get(`/public/getticker?market=BTC-RVN`)
                
            exchangeRate.flo = responseFLO.data.result;
            exchangeRate.rvn = responseRVN.data.result;

            res.status(201).json({exchangeRate})
        } catch (error) {
            console.log(error);
        }
    },



    getDepositAddresses: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            // GET FLO ADDY
            const messageGetFloAd = `https://api.bittrex.com/api/v1.1/account/getdepositaddress?apikey=${apiKey}&currency=FLO&nonce=1542020339856`;
            const signature = Crypto.createHmac('sha512', secret)
            .update(messageGetFloAd)
            .digest('hex');

            let bittrexAddresses = {
                flo: null,
                rvn: null,
            }
            
            const responseFLO = await bittrex.get(messageGetFloAd, {headers: {apisign: signature}})
            
            console.log(responseFLO)

            if(responseFLO.data.message === 'ADDRESS_GENERATING'){
                const responseFLO = await bittrex.get(messageGetFloAd, {headers: {apisign: signature}})
                bittrexAddresses.flo = responseFLO.data.result
            }

            if(responseFLO.data.success){
                bittrexAddresses.flo = responseFLO.data.result
            }

            // GET RVN ADDY
            const messageGetRvnAd = `https://api.bittrex.com/api/v1.1/account/getdepositaddress?apikey=${apiKey}&currency=RVN&nonce=1542020339856`;
            const signatureRvn = Crypto.createHmac('sha512', secret)
            .update(messageGetRvnAd)
            .digest('hex');

            const responseRVN = await bittrex.get(messageGetRvnAd, {headers: {apisign: signatureRvn}})
            
            console.log(responseRVN)

            //First time it runs; need to create an Address
            if(responseRVN.data.message === 'ADDRESS_GENERATING'){
                const responseRVN = await bittrex.get(messageGetRvnAd, {headers: {apisign: signature}})
                bittrexAddresses.rvn = responseRVN.data.result
            }

            if(responseRVN.data.success){
                
                bittrexAddresses.rvn = responseRVN.data.result
            }
            res.status(201).json({bittrexAddresses})
        } catch (error) {
            console.log(error);
        }
    },

    // GoodTillCancel (GTC)
        // placed by a trader to purchase or sell at a 
        // particular price which remains active until it’s cancelled by the trader.
    // ImmediateOrCancel (IOC)
        // order to buy or sell at the limit price that executes all or part immediately and 
        // cancels any unfilled portion of the order. If the order 
        // can't be filled immediately, even partially, it will be cancelled immediately. 

    createSell: async (req, res) => {
        try {
            /*
                market: string FLO | RVN
                quantity: decimal (amount to sell)
                rate: decimal (rate at which to place order)
                timeInForce: string IOC | GTC
            */

        const { market, quantity, rate,  timeInForce } = req.body;

        const user = await User.findById(req.user.id).select("bittrex")

        let apiKey = user.bittrex.apiKey
        let secret = user.bittrex.secret

        const message = `https://api.bittrex.com/api/v1.1/market/selllimit?apikey=${apiKey}&market=BTC-${market}&quantity=${quantity}&rate=${rate}&nonce=${nonce}`
        .update(message)
        .digest('hex');


        const response = await bittrex.get(message, {headers: {apisign: signature}})
        
        console.log(response);

        res.status(201).json(response.data)
        } catch (error) {
            console.log(error);
        }
    },

    openOrders: async(req, res) => {
        try {

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret
        
            let openOrders = {
                flo: null,
                rvn: null
            }

            const message = `https://api.bittrex.com/api/v1.1/market/getopenorders?apikey=${apiKey}&market=BTC-FLO&nonce=${nonce}`
            const signature = Crypto.createHmac('sha512', secret)
            .update(message)
            .digest('hex');
    
            const responseFloOrders = await bittrex.get(message, {headers: {apisign: signature}})
            
            openOrders.flo = responseFloOrders.data.result
        
            const messageRvn = `https://api.bittrex.com/api/v1.1/market/getopenorders?apikey=${apiKey}&market=BTC-RVN&nonce=${nonce}`
            const signatureRvn = Crypto.createHmac('sha512', secret)
            .update(messageRvn)
            .digest('hex');
    
            const responseRvnOrders = await bittrex.get(messageRvn, {headers: {apisign: signatureRvn}})
            
            openOrders.rvn = responseRvnOrders.data.result
            
            res.status(201).json({openOrders})
        } catch (error) {
            console.log(error)
        }
    },


    getBalance: async (req,res) => {
        try {

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            const message = `https://api.bittrex.com/api/v1.1/account/getbalances?apikey=${apiKey}&nonce=${nonce}`
            const signature = Crypto.createHmac('sha512', secret)
            .update(message)
            .digest('hex');
    
            const response = await bittrex.get(message, {headers: {apisign: signature}})
        
            res.status(201).json(response.data)
        } catch (error) {
            console.log(error)
        }
    },

    withdraw: async (req,res) => {
        try {
             /*
                currency: string  BTC | FLO | RVN
                quantity: quantity of coins to withdraw
                address: address where to send the funds
                paymentid: for memo/message/tag/paymentid option.
            */
            const {currency, quantity, address, paymentid } = req.body

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            const message = `https://api.bittrex.com/api/v1.1/account/withdraw?apikey=${apiKey}&currency=${currency}&quantity=${quantity}&address=${address}&nonce=${nonce}`
            const signature = Crypto.createHmac('sha512', secret)
            .update(message)
            .digest('hex');
    
            const response = await bittrex.get(message, {headers: {apisign: signature}})
            console.log(response)
        
            res.status(201).json(response.data)
        } catch (error) {
            
        }
    }


}