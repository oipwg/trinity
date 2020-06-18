const https = require('https');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Client = require('../spartanBot').Client;
const { Rent } = require('../helpers/rentValues')
const fs = require('fs');


class DailyBudget {
    constructor(inputs, user){
        this.targetMargin = inputs.targetMargin
        this.profitReinvestment = inputs.profitReinvestment
        this.Xpercent = inputs.Xpercent
        this.token = inputs.token
        this.inputs = inputs
        this.user = user
    }

    savePriceBtcUsd(PriceBtcUsd) {
        let profiles = this.user.profiles
        for(let profile of profiles) {
            if(profile._id.toString() === this.inputs.profile_id) {
                profile.priceBtcUsd = Number(PriceBtcUsd)
                this.user.save()
            }
        }
    }

    async updateDailyBudget(MarketPrice) {
        try {
            let priceUSD = await this.getPriceBtcUsd()
            const PriceBtcUsd = priceUSD.data.rates.USD;
            this.savePriceBtcUsd(PriceBtcUsd)
            const Networkhashrate = ( await Rent(this.token, this.Xpercent) ).Networkhashrate
            const MarketPriceMrrScrypt = MarketPrice * 1000 / 24; // convert to TH/s devided by 24 => 1000/24
            const Duration = 24;
            const Percent = this.Xpercent / 100;
            const Margin = this.targetMargin / 100;
            const ProfitReinvestmentRate = this.profitReinvestment / 100;
            let EstRentalBudgetPerCycleUSD = Networkhashrate * MarketPriceMrrScrypt * Duration * (-Percent / (-1 + Percent)) * PriceBtcUsd * (Margin * ProfitReinvestmentRate + 1);
            console.log('In dailyBudget.js EstRentalBudgetPerCycleUSD:', EstRentalBudgetPerCycleUSD)
            return EstRentalBudgetPerCycleUSD  || 0
        } catch(e) {
            console.log('e:', e)
        } 
    }

    async marketPrice() {
        let MRR = {}
        let NiceHash = {}
        let providers = this.inputs.SpartanBot.rental_providers;

        try {
            for (let provider of providers) {    
                if (provider.getInternalType() === 'MiningRigRentals') {
                    let response = await provider.getAlgo('scrypt', 'BTC');
                    MRR.success = true;
                    MRR.marketPriceMrrScryptBtcThSD = response.data.suggested_price.amount;
                }
    
                if (provider.getInternalType() === 'NiceHash') {
                    let orderBook = await provider.getOrderBook();
                    let orders = orderBook.stats.USA.orders;
                    let length = orders.length;
                    let lowestPrice = orders[0].price;
    
                    for (let i = 0; i < length; i++) {
                        if (orders[i].rigsCount > 0) {
                            if (orders[i].price < lowestPrice) {
                                lowestPrice = orders[i].price;
                            }
                        }
                    }
    
                    NiceHash.success = true;
                    NiceHash.marketPriceNhScryptBtcThSD = lowestPrice / 1000;
                }
            }
        } catch(e) {
            console.log('Error:', e)
        }

        if (MRR.success && NiceHash.success) {
            return NiceHash.marketPriceNhScryptBtcThSD
        } else if (MRR.success) {
            return MRR.marketPriceMrrScryptBtcThSD
        } else if (NiceHash.success) {
            return NiceHash.marketPriceNhScryptBtcThSD
        }
    }

    async getPriceBtcUsd() {
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

    async getDailyBudget() {
        try {
            let marketPriceScryptBtcThSD = await this.marketPrice()
            return await this.updateDailyBudget(marketPriceScryptBtcThSD);
        } catch(err) {
            console.log('dailyBudget.js err:', err)
        }
        
    }
}



router.post('/', async (req, res)=> {
    let inputs = req.body

    let user = await User.findById({ _id: inputs.userId});
    inputs.userName = user.userName
    let outputs = await Client.controller(inputs) // Attaches SpartanBot to inputs
    let dailyBudget = (await new DailyBudget(outputs, user).getDailyBudget() ).toFixed(2)

    res.json(dailyBudget)
})

module.exports = router;