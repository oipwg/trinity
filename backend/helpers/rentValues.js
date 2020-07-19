const https = require('https');

const Rent = async (token, percent, marketFactor) => {
    let Percent = percent / 100
    if (token === "FLO") {

        console.log('Percent:', Percent)
        return await new Promise((resolve, reject) => {
            https.get('https://livenet.flocha.in/api/status?q=getInfos', (response) => {
                let body = ''
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    try {

                        let data = JSON.parse(body)
                        if (!data) console.log('Data variable in rent function rentValues.js needs to have a catch for it, Flocha api is down!')
                        let difficulty = data.info.difficulty
                        let hashrate = difficulty * Math.pow(2, 32) / 40
                        let Networkhashrate = hashrate / marketFactor;
                        let Rent = Math.floor( Networkhashrate * (-Percent / (-1 + Percent)) *1e2 ) /1e2;
                        // let Rent = Networkhashrate * (-Percent / (-1 + Percent))
                        let MinPercentFromMinHashrate = marketFactor * .01 / ((difficulty * Math.pow(2, 32) / 40) + (marketFactor * .01))
                        resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate, hashrate })
                    } catch (err) {
                        console.log('Flocha API is down')
                    }
                });
            }).on("error", (error) => {
                console.log("Error: " + error.message);
                reject("Error: " + error.message)
            });
        })
    }

    if (token === "RVN") {
        // let Percent = percent / 100
        return await new Promise((resolve, reject) => {
            https.get('https://rvn.2miners.com/api/stats', (response) => {
                let body = ''
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    console.log('PERCENT', Percent)
                    let data = JSON.parse(body)
                    if (!data) console.log('Something wrong with the api or syntax')
                    let difficulty = data.nodes[0].difficulty;
                    let hashrate = data.nodes[0].networkhashps;
                    let Networkhashrate = hashrate / marketFactor;
                    let Rent = Math.floor( Networkhashrate * (-Percent / (-1 + Percent)) *1e2 ) /1e2;
                    let MinPercentFromMinHashrate = marketFactor * .01 / ((difficulty * Math.pow(2, 32) / 60) + (marketFactor * .01))
                    resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate, hashrate })
                })
            }).on("error", (error) => {
                console.log("Error: " + error.message);
                reject("Error: " + error.message)
            })
        })
    }
}


const getPriceBtcUsd = async () => {
    let promise = new Promise((resolve, reject) => {
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


class AutoRentCalculatons {
    constructor(spartanbot) {
        this.SpartanBot = spartanbot
        this.providers = spartanbot.rental_providers
        this.nicehashMinRentalCost = 0.005
        this.BittrexMinWithdrawal = 0.0015

        this.MRR = {}
        this.NiceHash = {}
        this.options = {}
    }

    async getmarketPriceScryptBtcThSD(options) {

        // Line below is for incase you want to run getmarketPriceScryptBtcThSD again with options seperately
        for (let provider of this.providers) {
            if (provider.getInternalType() === 'MiningRigRentals') {
                // Switch hashrate to MH/s due to MRR accepts it that way
                // let hashrate = options.hashrate * 1000000

                let response = await provider.getAlgo(options.algorithm, 'BTC');

                this.MRR.success = true
                this.MRR.MarketPriceMrrScryptBtcThSD = response.data.suggested_price.amount
            }

            if (provider.getInternalType() === 'NiceHash') {
                let algorithm = options.algorithm
                console.log('algorithm:', algorithm)
                let orderBook = await provider.getOrderBook(algorithm);

                this.options.marketFactor = orderBook.stats.USA.marketFactor;
                this.options.displayMarketFactor = orderBook.stats.USA.displayMarketFactor;

                let orders = orderBook.stats.USA.orders;
                let length = orders.length;

                let summariesKawpow = await provider.getStandardPrice(algorithm)
                let PriceRentalStandard=
                    Math.floor((
                        10 * summariesKawpow.summaries[`USA,${algorithm}`].payingPrice
                    )*1e8)/1e8
                    console.log('PriceRentalStandard:', PriceRentalStandard)

                // if (!length) {
                //     this.NiceHash.success = true
                //     this.NiceHash.MarketPriceNhScryptBtcThSD = 0

                //     return;
                // }

                // let lowestPrice = orders[0].price;

                // for (let i = 0; i < length; i++) {
                //     if (orders[i].rigsCount > 0) {
                //         if (orders[i].price < lowestPrice) {
                //             lowestPrice = orders[i].price;
                //         }
                //     }
                // }

                this.NiceHash.success = true
                this.NiceHash.MarketPriceNhScryptBtcThSD = PriceRentalStandard;
                console.log('this.NiceHash.MarketPriceNhScryptBtcThSD', this.NiceHash.MarketPriceNhScryptBtcThSD)
            }
        }

        if (this.MRR.success && this.NiceHash.success) {
            return this.NiceHash.MarketPriceNhScryptBtcThSD
        } else if (this.MRR.success) {
            return this.MRR.MarketPriceMrrScryptBtcThSD
        } else if (this.NiceHash.success) {
            return this.NiceHash.MarketPriceNhScryptBtcThSD
        }
    }

    async getNiceHashAmount(options) {
        let hashrate = options.hashrate

        if (!options) {
            throw new Error('options doesn\'t exist')
        }

        if (options.type === 'FIXED') {
            const provider = this.providers.filter(providers => providers.constructor.name === 'NiceHashProvider')[0];
            let res;

            try {
                res = await provider.getFixedPrice({
                    limit: hashrate,
                    market: 'USA',
                    algorithm: options.algorithm
                });
            } catch (err) {
                return {
                    err
                };
            }

            // hashrate is based on if current hashrate is below the threshold NiceHash allows of .01
            return {
                amount: this.nicehashMinRentalCost,
                hashrate: options.hashrate,
                price: res.fixedPrice
            };
        } else if (options.type === 'STANDARD') {
            let minHashrate = hashrate < 0.01 ? .01 : hashrate;
            let amount = (options.duration * minHashrate * this.NiceHash.MarketPriceNhScryptBtcThSD / 24).toFixed(11);
            let price = this.NiceHash.MarketPriceNhScryptBtcThSD;

            return {
                amount,
                hashrate,
                price
            };
        }
    }

    roundNumber() {

    }

    getOptions() {
        return this.options
    }



    MinPercentFromNHMinLimitCalc(token, marketFactor,Networkhashrate) {
        if (token === 'RVN') {
            let MinPercentFromNHMinLimitRvn =
                Math.round((
                    0.1 / (Networkhashrate + 0.1)
                ) * 1e8) / 1e8;
            return MinPercentFromNHMinLimitRvn
        }
        if (token === 'FLO') {
            let MinPercentFromNHMinLimitScrypt =
                Math.floor((
                    0.01 / (Networkhashrate + 0.1)
                ) * 1e8) / 1e8;
            return MinPercentFromNHMinLimitScrypt
        }
    }

    // If Xpercent was changed from it being to low, it then updates the values to match it (amount, limit, price)
    async updateNiceHashValues(options) {
        let networkValues = await Rent(options.token, options.Xpercent, this.options.marketFactor)

        options.hashrate = networkValues.Rent
        let Networkhashrate = networkValues.hashrate / this.options.marketFactor;
        let niceHashValues = await this.getNiceHashAmount(options)
        console.log('niceHashValues: UPDATED', niceHashValues)

        options.Networkhashrate = Networkhashrate
        options.amount = niceHashValues.amount
        options.limit = niceHashValues.hashrate;
        options.price = (niceHashValues.price).toFixed(4);
        return options
    }


    async niceHashCalculation(options) {
        let NiceHashProvider = options.NiceHashProvider
        let MRRProvider = options.MRRProvider


        await this.getmarketPriceScryptBtcThSD(options)
        
        try {
            let usersSelectedDuration = options.duration
            let PriceRentalStandard = this.NiceHash.MarketPriceNhScryptBtcThSD

            let marketFactor = this.options.marketFactor
            let networkValues = await Rent(options.token, options.Xpercent, marketFactor)

            options.hashrate = networkValues.Rent

            let Networkhashrate = networkValues.hashrate / marketFactor;


            let niceHashValues = await this.getNiceHashAmount(options)
            console.log('niceHashValues:', niceHashValues)

            options.Networkhashrate = Networkhashrate
            options.amount = niceHashValues.amount
            options.limit = niceHashValues.hashrate;
            options.price = (niceHashValues.price).toFixed(4);


            let MinPercentFromNHMinLimit = this.MinPercentFromNHMinLimitCalc(options.token, marketFactor, Networkhashrate)
            console.log('MinPercentFromNHMinLimit:', MinPercentFromNHMinLimit)

            let MinPercentFromMinAmount = 
            Math.ceil((
                (this.nicehashMinRentalCost / ((Networkhashrate * PriceRentalStandard / 24 * usersSelectedDuration) + this.nicehashMinRentalCost))
            ) * 1e6) / 1e6;
            console.log('MinPercentFromMinAmount:', MinPercentFromMinAmount)

            let MinPercentFromBittrexMinWithdrawal = Math.floor((
                this.BittrexMinWithdrawal / (this.BittrexMinWithdrawal + Networkhashrate * PriceRentalStandard * usersSelectedDuration)
            ) * 1e6) / 1e6;

            let MaxMinFromNicehash = Math.ceil ( Math.max(MinPercentFromMinAmount, MinPercentFromNHMinLimit) * 1000) / 1000
            console.log('MaxMinFromNicehash:', MaxMinFromNicehash)
            let MinMinFromNicehash = Math.min(MinPercentFromMinAmount, MinPercentFromNHMinLimit)
            console.log('MinMinFromNicehash:', MinMinFromNicehash)
            let NetworkPercent = options.Xpercent / 100
            console.log('NetworkPercent:', NetworkPercent)
            console.log(typeof NetworkPercent, typeof MaxMinFromNicehash)
           let message = [];
            if (NiceHashProvider) {
                if (NetworkPercent >= MaxMinFromNicehash) {
                    if (MRRProvider) { // true if Nicehash is selected, users value for NetworkPercent is above NH's mins and MRR is selected
                        options.MRRProvider = true
                        options.NiceHashProvider = true
                        message.push('Either provider is greater than MaxMinFromNicehash pricing. ')
                    } else { // true if Nicehash is selected, users value for NetworkPercent is above NH's mins and MRR is NOT selected
                        message.push('Proceed using only NiceHash. \n')
                        options.NiceHashProvider = true
                    }
                } else if (MRRProvider) { // true if Nicehash is selected and users value for NetworkPercent is NOT above NH's mins and MRR is selected
                    options.Xpercent = (MaxMinFromNicehash * 100).toFixed(2)
                    options.MRRProvider = true
                    options.NiceHashProvider = true
                    await this.updateNiceHashValues(options)
                    message.push('In order to continue.. your percent is replaced with MaxMinFromNicehash, proceed using either provider. But now the best price will be chosen. \n')
                } else { //true if Nicehash is selected and users value for NetworkPercent is NOT above NH's mins and MRR is NOT selected
                    options.NiceHashProvider = true
                    options.Xpercent = (MaxMinFromNicehash * 100).toFixed(2)
                    await this.updateNiceHashValues(options)
                    message.push('In order to continue.. your percent is replaced with MaxMinFromNicehash, proceed using only NiceHash. \n')
                }
            } else if (MRRProvider) {
                if (NetworkPercent >= MinPercentFromBittrexMinWithdrawal) { // true if Nicehash is NOT selected and MRR is selected and NetworkPerecent is above Bittrex's mins 
                    options.MRRProvider = true
                    
                    message.push('Proceed using only MiningRigRentals. \n')
                } else { // true if Nicehash is NOT selected and MRR is selected and NetworkPerecent is NOT above Bittrex's mins 
                    options.MRRProvider = true
                    options.Xpercent = (MinPercentFromBittrexMinWithdrawal * 100).toFixed(2)
                    await this.updateNiceHashValues(options)
                    message.push('In order to continue.. your percent is replaced MinPercentFromBittrexMinWithdrawal. Proceed using only Mining Rig Rentals \n')
                }
            }

            let MRRselectedProvider = options.MRRProvider
            let NiceHashSelectedProvider = options.NiceHashProvider

            if(MRRselectedProvider && NiceHashSelectedProvider) {
                message.push('Both markets are a success.')
                if(this.NiceHash.MarketPriceNhScryptBtcThSD < this.MRR.MarketPriceMrrScryptBtcThSD) {
                    message.push('Nicehash pricing is best.')
                    options.market = 'NiceHash'
                } else {
                    message.push('MiningRigRentals pricing is best.')
                    options.market = 'MiningRigRentals'
                }
            } else if (MRRselectedProvider) {
                options.market = 'MiningRigRentals'
            } else if (NiceHashSelectedProvider) {
                options.market = 'NiceHash'
            }
            options.dailyBudget = (await this.getDailyBudget(options)).EstRentalBudgetPerCycleUSD.toFixed(2)
            console.log('options.MRRProvider, options.NiceHashProvider', options.MRRProvider, options.NiceHashProvider)
            console.log('this.NiceHash.MarketPriceNhScryptBtcThSD', this.NiceHash.MarketPriceNhScryptBtcThSD)
            console.log('this.MRR.MarketPriceMrrScryptBtcThSD', this.MRR.MarketPriceMrrScryptBtcThSD)


            
            // console.log('OPTIONS', options)
            return {
                message: message,
                Networkhashrate: options.Networkhashrate,
                amount: options.amount,
                limit: options.limit,
                price: options.price,
                Xpercent: options.Xpercent,
                MRRProvider: options.MRRProvider,
                NiceHashProvider: options.NiceHashProvider,
                // rentValuesSuccess: options.success,
                type: options.type,
                dailyBudget: options.dailyBudget,
                displayMarketFactor: options.autoRentCalculations.options.displayMarketFactor,
                marketFactor: options.autoRentCalculations.options.marketFactor,
                market: options.market,
                autoRent: false,
                autoRentCalculations: options.autoRentCalculations,
                algorithm: options.algorithm,
            }
            // let lowestPriceGHs = this.NiceHash.MarketPriceNhScryptBtcThSD;
            // // Checks if the new renting hashrate price is lower than the min amount NiceHash accepts of 0.005 , compared to users Xpercent
            // if (lowestPriceGHs < this.nicehashMinRentalCost) {

            //       console.log('MinPercentFromMinAmount: rentvalues.js', MinPercentFromMinAmount)

            //     let getNewHashrate = await options.newRent(options.token, MinPercentFromMinAmount);

            //     let hashrateRoundedUp = this.roundNumber(getNewHashrate.Rent);
            //     let newAmount = (await this.getNiceHashAmount(hashrateRoundedUp)).amount;
            //     let percentFROMdecimal = options.token === 'FLO' ? 100.1 : 1;
            //     options.amount = newAmount;

            //         let msg = JSON.stringify({
            //             userId: options.userId,
            //             message: "Your current percent of ".concat(options.Xpercent, "% increased to ").concat((MinPercentFromMinAmount * percentFROMdecimal).toFixed(2), "% ") + "in order to rent with NiceHash's min. Amount of 0.005",
            //             db: {
            //                 Xpercent: (MinPercentFromMinAmount * percentFROMdecimal).toFixed(2)
            //             }
            //         });
            //         options.emitter.emit('message', msg);
            // }

        } catch (err) {
            return err
        }
    }

    savePriceBtcUsd(PriceBtcUsd) {

        let profiles = this.user.profiles
        for (let profile of profiles) {
            if (profile._id.toString() === this.options.profile_id) {
                profile.priceBtcUsd = Number(PriceBtcUsd)
                break;
            }
        }

        return this.user.save()
    }

    async getDailyBudget(options) {

        // this.options = {...this.options, ...options}
        this.user = options.User
        let { targetMargin, profitReinvestment, Xpercent, token } = options

        let marketPriceScryptBtcThSD = await this.getmarketPriceScryptBtcThSD(options)

        try {
            let priceUSD = await getPriceBtcUsd()
            const PriceBtcUsd = priceUSD.data.rates.USD;
            this.savePriceBtcUsd(PriceBtcUsd)
            const Networkhashrate = (await Rent(token, Xpercent, this.options.marketFactor)).Networkhashrate
            // const MarketPriceMrrScrypt = marketPriceScryptBtcThSD * 1000 / 24; // convert to TH/s devided by 24 => 1000/24
            const MarketPriceMrrScrypt = marketPriceScryptBtcThSD / 24
            const Duration = 24;
            const Percent = Xpercent / 100;
            const Margin = targetMargin / 100;
            const ProfitReinvestmentRate = profitReinvestment / 100;
            let EstRentalBudgetPerCycleUSD = Networkhashrate * MarketPriceMrrScrypt * Duration * (-Percent / (-1 + Percent)) * PriceBtcUsd * (Margin * ProfitReinvestmentRate + 1);
            console.log('In rentValues.js EstRentalBudgetPerCycleUSD:', EstRentalBudgetPerCycleUSD)
            this.options.dailyBudget = EstRentalBudgetPerCycleUSD
            return { EstRentalBudgetPerCycleUSD: EstRentalBudgetPerCycleUSD || 0, Networkhashrate }
        } catch (e) {
            console.log('getDailyBudget:', e)
        }
    }
}


module.exports = { AutoRentCalculatons, Rent, getPriceBtcUsd }
