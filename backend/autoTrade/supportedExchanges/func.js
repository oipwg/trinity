require('dotenv').config();
const { API_URL}  = process.env
const {timestamp} = require('../../helpers/timestamp')
const axios = require('axios');


const getTotalQty = (receivedQtyHourly, feeFloTx1) => {
    return Number((receivedQtyHourly + feeFloTx1).toFixed(8));
}

const getOfferPriceBtc = (costOfRentalBTCHourly, bittrexTradeFee, targetMargin, bittrexWithdrawlFee, estFeeBtcTx1, sellableQty) => {
    console.log({costOfRentalBTCHourly, bittrexTradeFee, targetMargin, bittrexWithdrawlFee, estFeeBtcTx1, sellableQty})
    let OfferPrice =   ( costOfRentalBTCHourly * ( bittrexTradeFee + 1 ) * ( targetMargin + 1 ) + bittrexWithdrawlFee + estFeeBtcTx1 ) / sellableQty
    return Number(OfferPrice.toFixed(8))
}

const getSellableQty = (totalQty, feeFloTx2) => {
    return Number((totalQty - feeFloTx2).toFixed(8))
}

const getProfitUsd = (BtcFromTrades, PriceBtcUsd, CostOfRentalUsd) => {
    return  ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
}

const getRentalBudget3HrCycleUsd = (CostOfRentalUsd, ProfitUsd, ProfitReinvestmentRate) => {
   return  RentalBudget3HrCycleUsd = CostOfRentalUsd + ( ProfitUsd * (ProfitReinvestmentRate) )
}

const getRentalBudgetDailyUsd = (RentalBudget3HrCycleUsd) => {
   return RentalBudget3HrCycleUsd * 8;
}

const getTakeProfitBtc = (ProfitUsd, ProfitReinvestmentRate, PriceBtcUsd) => {
   return  Number((ProfitUsd * (1 - ProfitReinvestmentRate) / PriceBtcUsd).toFixed(8))
}

const getUpdateUnsold = (updateUnsold) => {
    return Number((60 / updateUnsold))
}

const get24hOfferPriceBtc = (costOfRentalFromCancelledOffer, costOfRentalBTCHourly, bittrexTradeFee, targetMargin, costOfWithdrawalPerCycleBTC, estFeeBtcTx1, sellableQty) => {    
    let OfferPrice = (( costOfRentalFromCancelledOffer + costOfRentalBTCHourly ) * ( bittrexTradeFee + 1 ) * ( targetMargin + 1 ) + ((costOfWithdrawalPerCycleBTC + estFeeBtcTx1)/24) ) / sellableQty
    return Number(OfferPrice.toFixed(8))
}

const get24hSellableQty = (tokensFromCancelledOffer, receivedQtyFloHourly, feeFloTx1Hourly) => {
    return Number(tokensFromCancelledOffer + (receivedQtyFloHourly + feeFloTx1Hourly ) - feeFloTx2Hourly)
}

const getCoinbaseBTCUSD = async () => {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC')

        return Number(response.data.data.rates.USD)
        
    } catch (error) {
        console.log(timestamp(),'Err; getCoinbaseBTCUSD -----', error)
    }
};

const getBittrexBtcUsd = async () => {
    try {
        const response = await axios.get('https://api.bittrex.com/api/v1.1/public/getticker?market=USD-BTC')

        return Number(response.data.result.Last)
        
    } catch (error) {
        console.log(timestamp(),'Err; getCoinbaseBTCUSD -----', error)
    }
};

const getPriceBittrexBtcToken = async (token) => {
    try {
        const response = await axios.get(`https://api.bittrex.com/api/v1.1/public/getticker?market=USD-${token}`)

        return Number(response.data.result.Last)
        
    } catch (error) {
        console.log(timestamp(),'Err; getCoinbaseBTCUSD -----', error)
    }
};

const getBlockHeightFlo = async () => {
    try {
        const res = await axios.get(`https://livenet.flocha.in/api/status?q=getInfo`)
    } catch (error) {
        console.log(timestamp(), error)
    }
}

const getBlockHeightRvn = async () => {
    try {
        const res = await axios.get(`https://rvn.bitspill.net/api/status?q=getInfo`)
    } catch (error) {
        console.log(timestamp(), error)
    }
}

async function getBalanceFromAddress(address){
    try {
        let res = await axios.get(`https://livenet.flocha.in/api/addr/${address}`)

        if(res.status != 200){
            return console.log(timestamp(),res)
        }

        return res.data    
    } catch (error) {
        console.log(timestamp(),'ERR; getBalanceFromAddress  -------', error)
    }
}

async function getTxidInfo(txid){
    try {
        let res = await axios.get(`https://livenet.flocha.in/api/tx/${txid}`)

        return res.data;

    } catch (error) {
        console.log("error")
    }
}

const getFees = async transactions => {
    console.log(timestamp(),'getting fees...')
    let total = 0;

    if(!transactions){
        return;
    }


    for(let i = 0; i < transactions.length; i++){
        
        let res = await axios.get(`https://livenet.flocha.in/api/tx/${transactions[i]}`)
        if(res.status != 200) return console.log(timestamp(),res)

        total += res.data.fees
    } 

    return Number(total.toFixed(8))
}

const checkMarketPrice = async (offerPrice) => {
    try {
        const res = await axios.get('https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-FLO')
        let marketPrice = res.data.result.Bid

        console.log(timestamp(),'checking market price', {offerPrice, marketPrice}, 'offerPrice < marketPrice:', (offerPrice < marketPrice))
        if(offerPrice < marketPrice){
            return marketPrice
        }

    return offerPrice
    } catch (error) {
        console.log(timestamp(),'ERR; checkMarketPrice ------', error)
    }        
}

const getMinTradeSize = async (currency) => {
    try {
        const res = await axios.get(`https://api.bittrex.com/v3/markets/${currency}-BTC`)

        let data = res.data
        
        return data.minTradeSize;

    } catch (error) {
        console.log(error)
    }
}

const getCurrencyInfo = async (token) => {
    try {
        const res = await axios.get(`https://api.bittrex.com/v3/currencies/${token}`)

        return res.data
    } catch (error) {
        log(error)
    }
}

module.exports = {
    getTotalQty,
    getOfferPriceBtc,
    getSellableQty,
    getProfitUsd,
    getRentalBudget3HrCycleUsd,
    getRentalBudgetDailyUsd,
    getTakeProfitBtc,
    getCoinbaseBTCUSD,
    getBittrexBtcUsd,
    getPriceBittrexBtcToken,
    getBlockHeightFlo,
    getBlockHeightRvn,
    getBalanceFromAddress,
    getFees,
    checkMarketPrice,
    getTxidInfo,
    getMinTradeSize,
    getCurrencyInfo
}