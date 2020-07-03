require('dotenv').config();
const { API_URL}  = process.env
const { Account, Address, TransactionBuilder, Networks } = require('@oipwg/hdmw')
const bip32 = require('bip32')
const axios = require('axios')
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const { log }= require('../../helpers/log')

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

module.exports = async function(profile, accessToken, wallet, rentalAddress, name, duration) {
let TotalQty  = 0; //Receviced + FeeFloTx1
let ReceivedQty; //what is deposited from rentals
let FeeFloTx1; //cumulative fee from rentals.
// These values come from what resulted in the rentals;

let SellableQty; //Qty to sell; TotalQty - FeeFloTx2
let FeeFloTx2; //Fee from moving tokens from Local Wallet to Bittrex

let  OfferPriceBtc, //formula 
     EstFeeBtcTx1, //?
     BtcFromTrades = 0,
     PriceBtcUsd,
     ProfitUsd,// = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
     RentalBudget3HrCycleUsd,
     CostOfRentalUsd,
     totalSent = 0;

const CostOfWithdrawalPerCycleBTC = 0.0005;
const TradeFee= .002
let FloTradeFee;
let checkBlock;
let currentBlockCount;
let orderReceiptID = ''
let BtcFromsPartialTrades = 0;
let Confirms = 0;
let btc = 0;
let BLOCK_EXPLORER = ''
let bittrexTX
const ID = uuidv4();


const DURATION = duration

let {
    address,
    token,
    targetMargin,
    profitReinvestment,
    updateUnsold,
    dailyBudget,
    _id,
    CostOfRentalBtc
} = profile

const timeStarted = Date.now();
const margin = targetMargin / 100;
const ProfitReinvestmentRate = profitReinvestment / 100;
let userBTCAddress = address.btcAddress;
address = address.publicAddress;
let coin = token.toLowerCase();
if(coin === 'rvn' ){
    coin = 'raven'
}

const getCurrencyInfo = async (token) => {
    try {
        const res = await axios.get(`https://api.bittrex.com/v3/currencies/${token}`)

        return res.data
    } catch (error) {
        log(name, ID, error)
    }
}

let currency = await getCurrencyInfo(token)
let minConfirmations = currency.minConfirmations;
let MIN_FEE_PER_BYTE = 0.00000001




    if(!accessToken){
        log(name, ID, 'no access token');
        return 'ERROR; No Access Token'
    }
    if(!profile){
        log(name, ID, 'no profile');
        return 'ERROR; Profile Not Found'
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': accessToken
        },
    };

    switch(token){
        case 'FLO':
            BLOCK_EXPLORER = 'https://livenet.flocha.in'
            MIN_FEE_PER_BYTE = 0.00000001
            break;
        case 'RVN':
            BLOCK_EXPLORER = `https://main.rvn.explorer.oip.io`
            MIN_FEE_PER_BYTE = .0000001
            break;
    }



    // formulas
    const getTotalQty = (ReceivedQty, FeeFloTx1) => {
        return Number((ReceivedQty + FeeFloTx1).toFixed(8));
    }

    const getOfferPriceBtc = (CostOfRentalBtc, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2) => {
        let OfferPrice =  ( CostOfRentalBtc * ( TradeFee + 1 ) * ( margin + 1 ) + CostOfWithdrawalPerCycleBTC + EstFeeBtcTx1 ) / ( TotalQty - FeeFloTx2 )
        return Number(OfferPrice.toFixed(8))
    }

    const get24hOfferPriceBtc = (costOfRentalFromCancelledOffer, costOfRentalBTCHourly, bittrexTradeFee, targetMargin, costOfWithdrawalPerCycleBTC, estFeeBtcTx1, sellableQty) => {    
        let OfferPrice = (( costOfRentalFromCancelledOffer + costOfRentalBTCHourly ) * ( bittrexTradeFee + 1 ) * ( targetMargin + 1 ) + ((costOfWithdrawalPerCycleBTC + estFeeBtcTx1)/24) ) / sellableQty
        return Number(OfferPrice.toFixed(8))
    }
    

    const getSellableQty = (TotalQty, FeeFloTx2) => {
        return Number((TotalQty - FeeFloTx2).toFixed(8))
    }

    //bittrex wallet address
    const getBittrexAddress = async (token) => {
        try {
            
            let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

            if(res.status != 200){

            }

            return res.data.bittrexAddresses[token].Address

        } catch (error) {
            log(name, ID, 'getBittrexAddress Failed ------- ', error)
        }
    }

    const getBalanceFromAddress = async (address) => {
        try {
            let res = await axios.get(`${BLOCK_EXPLORER}/api/addr/${address}`)

            if(res.status != 200){
                return log(name, ID, res)
            }

            return res.data    
        } catch (error) {
            log(name, ID, 'ERR; getBalanceFromAddress  -------', error)
        }
    }

    const createSellOrder = async (market, quantity, rate) => {

        if((!(market && quantity && rate))){
            log(name, ID, 'Failed', {market, quantity, rate})
            return;
        }

        rate = await checkMarketPrice(rate);

        let body = {
            market,
            quantity,
            rate,
        }
        
        log(name, ID, 'running createSellOrder -------', body)


        try {
            const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)

            return res.data;
        } catch (error) {
            log(name,'error ---', error)
        }
        
    }

    const updateOrder = async (orderUuid, market, quantity, rate) => {
        try {

        log(name, ID, "UPDATING ORDER", {orderUuid, market, quantity, rate})

        rate = await checkMarketPrice(rate);
        
        //check to see if order has been partially sold.
        let order = await getOrder(orderUuid)

        log(name, ID, {order})

        // if partially filled remove for rate - already acounter for in totalSent
        let amountSold = Number((order.Quantity - order.QuantityRemaining).toFixed(8))
        BtcFromsPartialTrades = Number((order.Price - order.CommissionPaid).toFixed(8))

        log(name, ID, {BtcFromsPartialTrades})

        quantity -= amountSold;

        if((!(market && quantity && rate))){
            return log(name, ID, 'Failed', {market, quantity, rate})
        }

        rate = await checkMarketPrice(rate);

        let body = {
            orderUuid,
            market,
            quantity,
            rate,
        }

        
        log(name, ID, {body})
            let res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)
            log(name, ID, {res})
            return res.data
        } catch (error) {
            log(name, ID, 'updateOrder ---', error)
        }
    }

    const getFees = async transactions => {
        log(name, ID, 'getting fees...')
        let total = 0;

        if(!transactions){
            return;
        }

    
        for(let i = 0; i < transactions.length; i++){
            
            let res = await axios.get(`${BLOCK_EXPLORER}/api/tx/${transactions[i]}`)
            if(res.status != 200) return log(name,res)

            total += res.data.fees
        } 

        return Number(total.toFixed(8))
    }

    const getSalesHistory = async (token, id) => {
        try {
            if(!id){
                return log(name, ID, 'no:', {id})
            }

            const res = await axios.get(`${API_URL}/bittrex/salesHistory`, config)


            let {salesHistory} = res.data;

            log(name, ID, {id})

            const orderCompleted = salesHistory.find(el => el.OrderUuid === id)

            if(orderCompleted){
                return Number((orderCompleted.Price - orderCompleted.Commission).toFixed(8))
            } else return;

        } catch (error) {
            log(name, ID, 'ERR; getSalesHistory ----', error)
        }
    }

    const getOrder = async (orderUuid) => {
        try {
            const res = await axios.get(`${API_URL}/bittrex/openOrders`, config)

            const openOrders = res.data;

            const order = openOrders.find(order => order.OrderUuid === orderUuid)

            return order;
        } catch (error) {
            log(name, ID, 'ERR; getOpenOrders ----', error)
        }
    }

    const getCoinbaseBTCUSD = async () => {
        try {
            const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC')

            return Number(response.data.data.rates.USD)
            
        } catch (error) {
            log(name, ID, 'Err; getCoinbaseBTCUSD -----', error)
        }
    };

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
    // Withdraw amount has to be 3 times greater than the fee (.0005 btc)
    const withdrawFromBittrex = async (currency, quantity, address) => {
        try {
            let body = {
                currency,
                quantity,
                address
            }

            log(name, ID, {body})
            let res = await axios.post(`${API_URL}/bittrex/withdraw`, body, config)
        
            return res.data;

        } catch (error) {
            log(name, ID,'ERR; withDrawFromBittrex -----', error)
        }
    }

    const buildTransaction = async (address, amount, coin) => {
        try {

            let addressObj = new Address(address, Networks[coin], false);



            let builder = new TransactionBuilder(Networks[coin], {
                from: addressObj,
                to: {[BittrexAddress]: amount}
            }, account)
            
            
            let iof = await builder
                    .buildInputsAndOutputs()
                    .then((calculated) => {
                        return calculated;
            })
    
    
            let fee = iof.fee * MIN_FEE_PER_BYTE;

            const adjustedAmount = Number((amount - fee).toFixed(8))
    
            let builder2 = new TransactionBuilder(Networks[coin], {
                from: addressObj,
                to: {[BittrexAddress]: adjustedAmount}
            }, account)
    
    
            let inNOuts = await builder2
                    .buildInputsAndOutputs()
                    .then((calculated) => {
                        return calculated;
            })
        
            return Number((inNOuts.fee * MIN_FEE_PER_BYTE).toFixed(8))
        } catch (error) {
            log(name, ID,'ERR; builTransaction ------', error)
        }

    }

    const checkMarketPrice = async (offerPrice) => {
        try {
            const res = await axios.get(`https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-${token}`)
            let marketPrice = res.data.result.Bid

            log(name, ID,'checking market price', {offerPrice, marketPrice}, 'offerPrice < marketPrice:', (offerPrice < marketPrice))
            if(offerPrice < marketPrice){
                return marketPrice
            }

        return offerPrice
        } catch (error) {
            log(name, ID,'ERR; checkMarketPrice ------', error)
        }        
    }
        // ------------  START -------------- 
    log(name, ID, 'START AUTO TRADE', {timeStarted, address, userBTCAddress, rentalAddress, token})

    if(!address){
        log(name, ID, 'No Address')
        return 'No Address'
    }


    const accountMaster = bip32.fromBase58(wallet[token.toLowerCase()].xPrv, Networks[coin].network)


    let account = new Account(accountMaster, Networks[coin]);
        account.discoverChains();

        let {balance, transactions} = await getBalanceFromAddress(address);
    const BittrexAddress = await getBittrexAddress(token);

            
        if(transactions){
            FeeFloTx1 = await getFees(transactions)
        } else {
            FeeFloTx1 = 0;
        }
            ReceivedQty = balance
            TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)


            log(name, ID,'pre call -----', {ReceivedQty, FeeFloTx1, TotalQty, BittrexAddress})
    

            if(balance > 0) {
                FloTradeFee = await buildTransaction(address, ReceivedQty, coin)
                let sendAmount = Number((ReceivedQty - (FloTradeFee)).toFixed(8))
                log(name, ID,'sending to bittrex: 1', {sendAmount, FloTradeFee})
                try {
                    bittrexTX = await account.sendPayment({
                        to: {[BittrexAddress]: sendAmount},
                        from: address,
                        discover: true
                    })
                    totalSent += sendAmount
                } catch (error) {
                    log(name, ID,'failed to send, will try again', error)
                }

            }

            if(bittrexTX){
                log(name, ID,{bittrexTX})
            }

                let isUpdate = false;


                const checkConfirmations = async () => {
                    try {

                        log(name, ID,'running checkConfirmation()...')

                        if(!bittrexTX) {
                            log(name, ID, {bittrexTX})
                            return;
                        }

                        let res = await axios.get(`${BLOCK_EXPLORER}/api/tx/${bittrexTX}`)

                        if(res.status != 200){
                            return log(name, ID,res)
                        }

                        let {fees, confirmations } = res.data
                        Confirms = confirmations;

                        FeeFloTx2 = fees
                        EstFeeBtcTx1=0.00001551 //! get from somewhere
            
                        TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                        SellableQty = getSellableQty(TotalQty, FeeFloTx2)               
                        OfferPriceBtc = getOfferPriceBtc(CostOfRentalBtc, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1,TotalQty,FeeFloTx1,FeeFloTx2)
                        OfferPrice24h = get24hOfferPriceBtc(0, CostOfRentalBtc, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, SellableQty)
                        log(
                                name,
                                ID,
                                '---check confirmations---',
                                { 
                                    confirmations,
                                    TotalQty,
                                    FeeFloTx1,
                                    FeeFloTx2,
                                    SellableQty,
                                    FeeFloTx2, 
                                    CostOfRentalBtc,
                                    TradeFee,
                                    margin,
                                    EstFeeBtcTx1,
                                    TotalQty,
                                    FeeFloTx1,
                                    FeeFloTx2,
                                    OfferPriceBtc,
                                    OfferPrice24h,
                                    totalSent,
                                    BtcFromTrades,
                                    btc,

                                }
                            )
    
                        if(Confirms > minConfirmations){
                            if(isUpdate){

                                    TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                                    SellableQty  = getSellableQty(TotalQty, FeeFloTx2)
                                    OfferPriceBtc = getOfferPriceBtc(CostOfRentalBtc, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2);
    
                                    log(
                                        name,
                                        ID,
                                        '---Updated---',
                                        { 
                                            TotalQty,
                                            FeeFloTx1,
                                            FeeFloTx2,
                                            SellableQty,
                                            FeeFloTx2, 
                                            CostOfRentalBtc,
                                            TradeFee,
                                            margin,
                                            EstFeeBtcTx1,
                                            TotalQty,
                                            FeeFloTx1,
                                            FeeFloTx2,
                                            OfferPriceBtc,
                                            totalSent,
                                            BtcFromTrades,
                                            btc,
                                        })

                                    log(name, ID,'If Update --- before function;', {SellableQty, OfferPriceBtc, orderReceiptID})
                            }

                            if(orderReceiptID){
                                
                                log(name, ID, 'update', {orderReceiptID})
                                let res = await updateOrder(orderReceiptID, token, totalSent, OfferPriceBtc)
                                if(res.success){
                                    orderReceiptID = res.result.uuid;
                                    checkOrderStatus()
                                    bittrexTX=null;
                                    log(name, ID,'updateOrder ---', {res, orderReceiptID})
                                    return BtcFromTrades =  await getSalesHistory(token, orderReceiptID);
                                } else {
                                    log(res)
                                }
                            } else {
                                log(name, ID, 'create order', bittrexTX)
                                
                                if(totalSent <= 0){
                                    return log(name, ID, {totalSent})
                                }

                                let res = await createSellOrder(token, totalSent, OfferPriceBtc)
                                if(res.success){
                                    orderReceiptID = res.result.uuid
                                    Confirms = 0;
                                    checkOrderStatus()
                                    bittrexTX=null;
                                    log(name, ID,'createSellOrder ---', {res, orderReceiptID})
                                    BtcFromTrades = await getSalesHistory(token, orderReceiptID);
                                } else {
                                    log(res)
                                }
                            }
                        }}
                    catch (error) {
                        log(name, ID,'EER; checkConfirmations ------', error)
                    }

                    
                }

                const shouldIUpdated =  async () => {
                    try {
                        log(name, ID,'runing shouldIUpdate()...')
                        const res = await getBalanceFromAddress(address);

                        if(!res) return;

                        updatedBalance = res.balance
                        transactions = res.transactions

                        if(bittrexTX) return;


                        if(updatedBalance > 0){
                            FeeFloTx1 = await getFees(transactions)
                            log(name, ID,'pre', {balance, updatedBalance, FeeFloTx1})
                            isUpdate = true;

                            //push new tokens to wallet
                            FloTradeFee = await buildTransaction(address, updatedBalance, coin)
                            log(name, ID,{FloTradeFee})
                            if(!FloTradeFee || (typeof FloTradeFee != 'number')) return;

                            let sendAmount = Number((updatedBalance - FloTradeFee).toFixed(8))
                            log(name, ID,'sending to bittrex: 2', {sendAmount})

                            try {
                                bittrexTX = await account.sendPayment({
                                    to: {[BittrexAddress]: sendAmount},
                                    from: address,
                                    discover: false
                                })
                                totalSent += sendAmount
                                ReceivedQty += updatedBalance;
                                log({bittrexTX})
                            } catch (error) {
                                log(name, ID,'failed to send, will try again', error)
                            }

                        } else {
                            log(name, ID,'Not enought to send to Bittrex', updatedBalance)

                        }
                    } catch (error) {
                        log(name, ID,error)
                    }
                }

            const checkOrderStatus = async () => {

                log(name, ID, 'Running checkOrderStatus().....', {orderReceiptID})
                if(!orderReceiptID){
                    return log({orderReceiptID})
                }

                let BtcFromTrades = await getSalesHistory(token, orderReceiptID)

                if(BtcFromTrades){
                    log(name, ID, {orderReceiptID}, 'CLOSED')
                    totalSent=0;
                    TotalQty=0;
                    SellableQty=0;
                    OfferPriceBtc=0;
                    orderReceiptID=''
                    BtcFromTrades += BtcFromsPartialTrades;
                    btc += BtcFromTrades;

                    
                    PriceBtcUsd = await getCoinbaseBTCUSD();
                    CostOfRentalUsd = CostOfRentalBtc * PriceBtcUsd
                    
                    ProfitUsd = getProfitUsd(BtcFromTrades, PriceBtcUsd, CostOfRentalUsd)
                    
                    RentalBudget3HrCycleUsd = getRentalBudget3HrCycleUsd(CostOfRentalUsd, ProfitUsd, ProfitReinvestmentRate);
                    
                    RentalBudgetDailyUsd = getRentalBudgetDailyUsd(RentalBudget3HrCycleUsd);
                    TakeProfitBtc = getTakeProfitBtc(ProfitUsd, ProfitReinvestmentRate, PriceBtcUsd)

                    log(
                        name,
                        ID,
                    {
                        BtcFromTrades,
                        btc,
                        PriceBtcUsd,
                        CostOfRentalUsd,
                        ProfitUsd,
                        ProfitReinvestmentRate,
                        RentalBudget3HrCycleUsd,
                        RentalBudgetDailyUsd,
                        TakeProfitBtc
                    
                    })
                }
            }

            const withdrawBTC = async () => {

                log(name, ID, {timeStarted}, Date.now(), (Date.now() > (timeStarted + (21 * ONE_HOUR))))

                if(btc <= 0){
                    return;
                }

                    log(name, ID,'Withdraw from bittrex ---')
                    let sentToHDMW = await withdrawFromBittrex('BTC', btc, rentalAddress);
                    btc = 0;
                    log(name, ID,'sentToProvider ---', sentToHDMW)
                    // clearAllIntervals(timer, update, orderStatus);
            }

            let timer = setInterval(() => {
                checkConfirmations()
            }, (3 * ONE_MINUTE))

            let update = setInterval(() => {
                shouldIUpdated()
            },(ONE_HOUR / updateUnsold))

            let orderStatus = setInterval(() => {
                checkOrderStatus()
            },(updateUnsold * (5 * ONE_MINUTE)))

            let withdraw = setInterval(() => {
                withdrawBTC()
            }, ((DURATION * ONE_HOUR) - ONE_HOUR))

            const clearAllIntervals = (timer, update, orderStatus) => {
                    log(name, ID, '--- TRADE END ---')
                    this.clearInterval(timer)
                    this.clearInterval(update)
                    this.clearInterval(orderStatus)
            }

}