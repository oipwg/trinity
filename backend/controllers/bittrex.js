require('dotenv').config();
const axios = require('axios');
const Crypto = require('crypto')
const nonce = `76932509675239680235`
const User = require('../models/user')
const {API_URL} = process.env

const bittrex = axios.create({
    baseURL: `https://api.bittrex.com/api/v1.1`,
    timeout: 2000,

})


module.exports = {
    //!Refactor this.
    exchangeRate: async(req, res ) => {
        try {

            let exchangeRate = {
                FLO: null,
                RVN: null,
                
        }   
        const responseFLO = await  bittrex
            .get(`/public/getticker?market=BTC-FLO`)
        const responseRVN = await  bittrex
            .get(`/public/getticker?market=BTC-RVN`)
        const responseBTC = await  bittrex
            .get(`/public/getticker?market=USD-BTC`)
        const responseTUSD = await bittrex
            .get(`/public/getticker?market=BTC-TUSD`)
        
                
            exchangeRate.FLO = responseFLO.data.result;
            exchangeRate.RVN = responseRVN.data.result;
            exchangeRate.BTC = responseBTC.data.result;
            exchangeRate.TUSD = responseTUSD.data.result;

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
                FLO: null,
                RVN: null,
                BTC: null,
                TUSD: null,
            }
            
            const responseFLO = await bittrex.get(messageGetFloAd, {headers: {apisign: signature}})
            
            if(responseFLO.data.message === 'ADDRESS_GENERATING'){
                const responseFLO = await bittrex.get(messageGetFloAd, {headers: {apisign: signature}})
                bittrexAddresses.FLO = responseFLO.data.result
            }

            if(responseFLO.data.success){
                bittrexAddresses.FLO= responseFLO.data.result
            }

            // GET RVN ADDY
            const messageGetRvnAd = `https://api.bittrex.com/api/v1.1/account/getdepositaddress?apikey=${apiKey}&currency=RVN&nonce=${nonce}`;
            const signatureRvn = Crypto.createHmac('sha512', secret)
            .update(messageGetRvnAd)
            .digest('hex');

            const responseRVN = await bittrex.get(messageGetRvnAd, {headers: {apisign: signatureRvn}})
            

            //First time it runs; need to create an Address
            if(responseRVN.data.message === 'ADDRESS_GENERATING'){
                const responseRVN = await bittrex.get(messageGetRvnAd, {headers: {apisign: signature}})
                bittrexAddresses.RVN = responseRVN.data.result
            }

            if(responseRVN.data.success){
                
                bittrexAddresses.RVN = responseRVN.data.result
            }

            //BTC
            const getBTCAddy = await (async () => {
                const message = `https://api.bittrex.com/api/v1.1/account/getdepositaddress?apikey=${apiKey}&currency=BTC&nonce=${nonce}`;
                const signature = Crypto.createHmac('sha512', secret)
                .update(message)
                .digest('hex');

                
                let response = await bittrex.get(message, {headers: {apisign: signature}})
                if(response.data.message === 'ADDRESS_GENERATING'){
                    response = await bittrex.get(message, {headers: {apisign: signature}})
                }
                return response.data
            })();


            bittrexAddresses.BTC = getBTCAddy.result;

            //TUSD
            const getTUSDAddy = await (async () => {
                const message = `https://api.bittrex.com/api/v1.1/account/getdepositaddress?apikey=${apiKey}&currency=TUSD&nonce=${nonce}`;
                const signature = Crypto.createHmac('sha512', secret)
                .update(message)
                .digest('hex');

                
                let response = await bittrex.get(message, {headers: {apisign: signature}})
                if(response.data.message === 'ADDRESS_GENERATING'){
                    response = await bittrex.get(message, {headers: {apisign: signature}})
                }
                return response.data
            })();


            bittrexAddresses.TUSD = getTUSDAddy.result;
        
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

    createSellOrder: async (req, res) => {
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
        const signature = Crypto.createHmac('sha512', secret)
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
        
            let openOrders = {}

            let getOrders = await (async () => 
                {
                    const message = `https://api.bittrex.com/api/v1.1/market/getopenorders?apikey=${apiKey}&nonce=${nonce}`
                    const signature = Crypto.createHmac('sha512', secret)
                    .update(message)
                    .digest('hex');


                    const response = await bittrex.get(message, {headers: {apisign: signature}})
                    return response.data;
                }
            )();

                if(!getOrders.success) return res.status(400).json({"error": getOrders.message})

                getOrders.result.map((arr, i) => {
                        openOrders[arr.Exchange] = arr 
                        }
                ) 
            
            
            res.status(201).json({openOrders})
        } catch (error) {
            console.log(error)
        }
    },


    getBalance: async (req,res) => {
        try {

            const user = await User.findById(req.user.id).select("bittrex")

            console.log(user)

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

    // BTC amount has to be 3 times greater than the fee
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
    },

    cancelOrder: async(req, res) => {
        try {

            const {orderUuid} = req.body



            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            const message = `https://api.bittrex.com/api/v1.1/market/cancel?apikey=${apiKey}&uuid=${orderUuid}&nonce=${nonce}`
            const signature = Crypto.createHmac('sha512', secret)
            .update(message)
            .digest('hex');
    
            const response = await bittrex.get(message, {headers: {apisign: signature}})
            console.log(response)
        
            res.status(201).json(response.data)
        } catch (error) {
            console.log(error)
        }
    },

    updateOrder: async (req, res) => {
        try {
            const { orderUuid, market, quantity, rate,  timeInForce } = req.body;

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            let cancelOrder = await (async () => {
                const message = `https://api.bittrex.com/api/v1.1/market/cancel?apikey=${apiKey}&uuid=${orderUuid}&nonce=${nonce}`;
                const signature = Crypto.createHmac('sha512', secret)
                    .update(message)
                    .digest('hex');
                const response = await bittrex.get(message, { headers: { apisign: signature } });
                return response.data;
            })();

            if(!cancelOrder.success) return res.json({"error": cancelOrder.message})

            let createOrder = await (async () => {
                const message = `https://api.bittrex.com/api/v1.1/market/selllimit?apikey=${apiKey}&market=BTC-${market}&quantity=${quantity}&rate=${rate}&nonce=${nonce}`
                const signature = Crypto.createHmac('sha512', secret)
                .update(message)
                .digest('hex');

                const response = await bittrex.get(message, {headers: {apisign: signature}})
                return response.data;
            })();
            
            console.log(createOrder)

            if(!createOrder.success) return res.json({"error": createOrder.message})

            res.status(201).json({'Success': createOrder.message})
        } catch (error) {
            console.log({error})
        }
    },

    createBuyOrder: async(req, res) => {
        try {
            const { market, quantity, rate,  timeInForce } = req.body;

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            if(!apiKey) {
                return res.status(400).json({"error": "no keys"})
            }

            const message = `https://api.bittrex.com/api/v1.1/market/buylimit?apikey=${apiKey}&market=BTC-${market}&quantity=${quantity}&rate=${rate}&nonce=${nonce}`
            const signature = Crypto.createHmac('sha512', secret)
            .update(message)
            .digest('hex');


            const response = await bittrex.get(message, {headers: {apisign: signature}})
            
            console.log(response);
            res.status(201).json(response.data)
        } catch (error) {
            console.log(error)
        }
    },

    salesHistory: async(req, res) => {
        try {

            const user = await User.findById(req.user.id).select("bittrex")

            let apiKey = user.bittrex.apiKey
            let secret = user.bittrex.secret

            if(!apiKey) {
                return res.status(400).json({"error": "no keys"})
            }
        
            let salesHistory = {}

            let getSalesHistory = await (async () => 
                {
                    const message = `https://api.bittrex.com/api/v1.1/account/getorderhistory?apikey=${apiKey}&nonce=${nonce}`
                    const signature = Crypto.createHmac('sha512', secret)
                    .update(message)
                    .digest('hex');


                    const response = await bittrex.get(message, {headers: {apisign: signature}})
                    
                    console.log(response)
                    return response.data;
                }
            )();

                if(!getSalesHistory.success) return res.status(400).json({"error": getSalesHistory.message})

                getSalesHistory.result.map((arr, i) => {
                        salesHistory[arr.Exchange] = arr 
                        }
                ) 
            
            
            res.status(201).json({salesHistory})
        } catch (error) {
            console.log(error)
        }
    },


}