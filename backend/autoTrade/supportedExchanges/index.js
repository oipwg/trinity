require('dotenv').config();
const { API_URL}  = process.env
const { Account, Address, TransactionBuilder, Networks } = require('@oipwg/hdmw')
const { log }= require('../../helpers/log')
const uuidv4 = require('../../helpers/uuidv4');
const {
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
} = require('./func')
const bip32 = require('bip32')
const axios = require('axios')


const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;


module.exports = async function(profile, accessToken, wallet, rentalAddress, name, duration) {
let {
    address,
    token,
    targetMargin,
    profitReinvestment,
    updateUnsold,
    dailyBudget,
    _id,
    CostOfRentalBtc,
    priceBtcUsd
} = profile


let MIN_FEE_PER_BYTE = 0;
    switch(token){
        case 'FLO':
            BLOCK_EXPLORER = 'https://livenet.flocha.in'
            MIN_FEE_PER_BYTE = 0.00000001
            break;
        case 'RVN':
            BLOCK_EXPLORER = `https://main.rvn.explorer.oip.io`
            MIN_FEE_PER_BYTE = .0000001
            break;
        default:
            BLOCK_EXPLORER = 'https://livenet.flocha.in'

    }


const ID = uuidv4();
const DURATION = duration
let coin = token.toLowerCase();
    if(coin === 'rvn' ){
        coin = 'raven'
    }
let currency = await getCurrencyInfo(token)
let minConfirmations = currency.minConfirmations;
const MIN_TRADE_SIZE = await getMinTradeSize(token)

let btcInfo = await getCurrencyInfo('BTC')
const CostOfWithdrawalPerCycleBTC = Number(btcInfo.txFee)
const BittrexComissionFee = Number(btcInfo.txFee)

    
    if(!accessToken){
        log(name, {ID} ,'no access token');
        return 'ERROR; No Access Token'
    }
    if(!profile){
        log(name, {ID} ,'no profile');
        return 'ERROR; Profile Not Found'
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': accessToken
        },
    };

    const postResults = async ({ID, _id, timestarted, costOfRentalBtc, priceBtcUsd, duration, btcFromTrades, totalMined, profitReinvestment, completedOrders}) => {
        try {

            log({ID, _id, timestarted, costOfRentalBtc, priceBtcUsd, duration, btcFromTrades, totalMined, profitReinvestment, completedOrders})

            let body = {
                uuid: ID,
                profile: _id,
                timestarted,
                costOfRentalBtc,
                priceBtcUsd,
                duration,
                btcFromTrades,
                totalMined,
                profitReinvestment,
                completedOrders,
            }

            axios.post(`${API_URL}/auto-trade/results`, body, config)

        } catch (error) {
            log(name, {ID}, 'postResults ---', error)
        }
    }

    const confirmedBalance = async (arr) => {
        let res = await axios.get(`${API_URL}/bittrex/closed-deposits`, config)
                        
        let closedDeposits = res.data;
        
        let tokens = 0;
        
        arr.map(txid => {
                let order = closedDeposits.find(order => order.txId == txid)

                if(order){
                    tokens += Number(order.quantity)
                }
    
            })

        return tokens;
    }

    const getBtcBalance = async (arr) => {
        let res = await axios.get(`${API_URL}/bittrex/closed-orders`, config)
        
        let closedOrders = res.data;
        
        let btcBalance = 0;

        arr.map(uuid => {
                let order = closedOrders.find(order => order.id == uuid)

                btcBalance += (order.proceeds - order.commission)
            })

            
        return Math.floor((btcBalance)*1e8)/1e8;
    }

    //bittrex wallet address
    const getBittrexAddress = async (token) => {
        try {
            
            let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

            if(res.status != 200){

            }

            return res.data.bittrexAddresses[token].Address

        } catch (error) {
            log(name, {ID} ,'getBittrexAddress Failed ------- ', error)
        }
    }

    const createSellOrder = async (market, quantity, rate) => {

        if((!(market && quantity && rate))){
            return log(name, {ID} ,'Failed', {market, quantity, rate})
        }

        rate = await checkMarketPrice(rate);

                
        let body = {
            market,
            quantity,
            rate,
        }
        
        log(name, {ID} ,'running createSellOrder -------', body)


        try {
            const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)

            return res.data;
        } catch (error) {
            log(name, {ID} ,'error ---', error)
        }
        
    }

    const updateOrder = async (orderUuid, market, quantity, rate) => {
        rate = await checkMarketPrice(rate);

        let body = {
            orderUuid,
            market,
            quantity,
            rate,
        }

        
        log(name, {ID} ,body)

        try {
            const res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)

            console.log({res})

            if(res){
                return res.data
            } else log(res)
        } catch (error) {
            log(name, {ID} ,'updateOrder ---', error)
        }
    }
    
    const getSalesHistory = async (token, id) => {
        try {
            if(!id){
                return log(name, {ID} , 'no:', {id})
            }

            const res = await axios.get(`${API_URL}/bittrex/salesHistory`, config)


            let {salesHistory} = res.data;

            log(name, {ID} , {id})

            const orderCompleted = salesHistory.find(el => el.OrderUuid === id)

            if(orderCompleted){
                return Number((orderCompleted.Price - orderCompleted.Commission).toFixed(8))
            } else return;

        } catch (error) {
            log(name, {ID} ,'ERR; getSalesHistory ----', error)
        }
    }

    const getOrder = async (orderUuid) => {
        try {
            const res = await axios.get(`${API_URL}/bittrex/order/${orderUuid}`, config)

            return res.data
        } catch (error) {
            log(name, {ID} ,'ERR; getOpenOrders ----', error)
        }
    }

    // Withdraw amount has to be 3 times greater than the fee (.0005 btc)
    const withdrawFromBittrex = async (currency, quantity, address) => {
        try {
            let body = {
                currency,
                quantity,
                address
            }

            log(name, {ID} , {body})
            let res = await axios.post(`${API_URL}/bittrex/withdraw`, body, config)
        
            return res.data;

        } catch (error) {
            log(name, {ID} ,'ERR; withDrawFromBittrex -----', error)
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
            log(name, {ID} ,'ERR; builTransaction ------', error)
        }

    }


    const checkBittrexDeposit = async (txId) => {
        try {
            const res = await axios.get(`${API_URL}/bittrex/deposit/${txId}`, config)

            if(res.data){
                return res.data
            } else {
                log(res)
            }

        } catch (error) {
            log({error})
        }
    }

    const sendPayment = async (BittrexAddress, address, amount, coin) => {
        try {

            if(amount <= 0){
                return " ----------- NO BALANCE -------------"
            }

            let fee = await buildTransaction(address, amount, coin)

            let sendAmount = Number((amount - (fee)).toFixed(8))

            let txid = await account.sendPayment({
                to: {[BittrexAddress]: sendAmount},
                from: address,
                discover: true
            })

            log({txid})

            return txid

            
        } catch (error) {
            log(name, {ID} , "ERR; SendPayment", error)
        }
    }

    const pushTokensToBittrex = async () => {
        log('pushTokensToBittrex')
        let res = await getBalanceFromAddress(BLOCK_EXPLORER, userAddress)

        if(res.balance > 0){
            let txid = await sendPayment(BittrexAddress, userAddress, res.balance, coin)
            log(name, {ID}, txid)

            if(txid){
                context.bittrexTxid.push(txid)
                context.pendingBalance = res.balance
            }
        } else {
            return;
        }
    }
    
    // ------------  START -------------- 

    if(!profile){
        log(profile, 'not found')
        return 'no profile found'
    }

    const accountMaster = bip32.fromBase58(wallet[token.toLowerCase()].xPrv, Networks[coin].network)
    let account = new Account(accountMaster, Networks[coin]);
    account.discoverChains();
    const margin = targetMargin / 100;
    const reinvestmentRate = profitReinvestment / 100;
    const BittrexAddress = await getBittrexAddress(token);
    const costOfRentalUsd = CostOfRentalBtc * priceBtcUsd

    let userBTCAddress = address.btcAddress;
    let userAddress = address.publicAddress;
    
    log(name, {ID} , 'START AUTO TRADE', {userAddress, userBTCAddress, rentalAddress})

    if(!address){
        log(name, {ID} ,'no address')
        return 'No Address'
    }

    const timerInt = () => setInterval(() => {
        return context.currentTime = Date.now() 
        }, 1000)

    let context = {
        totalQty: 0,
        receivedQty: 0,
        btcFromOrders: 0,
        bittrexBalance: 0,
        pendingBalance: 0,
        confirmedBalance: 0,
        offsetBal: 0,
        duration: DURATION,
        hour: 1,
        blockHeight: 0,
        sellableQty: 0,
        hourlyCostOfRentalBtc: 0,
        feeFloTx1: 0,
        feeFloTx2: 0,
        bittrexTradeFee: 0.002,
        bittrexWithdrawlFee: BittrexComissionFee,
        estFeeBtcTx1: 0.00001551,
        offerPriceBtc: 0,
        offerPriceBtc24h: 0,
        bittrexTxid: [],
        orders: [],
        completedOrders: [],
        currentOrder: null,
        currentTxid: '',
        startTime: Date.now(),
        currentTime: timerInt()
      }

      log(name, {ID}, {costOfRentalUsd, priceBtcUsd})


    const machine = {
          state: "START",
          transitions: {
              "START": {
                  starting: async function() {
                    log(name, {ID}, 'Staring...')


                    let {balance, transactions} = await getBalanceFromAddress(BLOCK_EXPLORER, userAddress)
                    let fees = await getFees(BLOCK_EXPLORER, transactions);

                    context.receivedQty = balance;
                    context.feeFloTx1 = fees
                    context.hourlyCostOfRentalBtc = Number((costOfRentalUsd / context.duration / priceBtcUsd).toFixed(8))
                    context.totalQty = getTotalQty(context.receivedQty, context.feeFloTx1)
                    log(name, {ID}, context)
                    context.currentTxid = context.bittrexTxid[context.bittrexTxid.length - 1]


                    let firstHour = () => Date.now() <= (context.startTime + ONE_HOUR) 
                    let consecHours = () => Date.now() <= (context.startTime + (context.duration * ONE_HOUR))
                    let pastDuration = () => Date.now() > (context.startTime + (context.duration * ONE_HOUR))

                    let currentHour = () => Math.floor((Date.now() - context.startTime) / ONE_HOUR)
                    context.hour = currentHour();

                    if(context.hour === 0){
                        context.hour = 1;

                        // //!
                        // //!
                    }
                    

                    switch(true){
                        case firstHour(): {
                            log('first hour')
                            this.changeState('TRANSFER')
                            return this.dispatch('moving')
                        }
                        case consecHours(): {
                            log('consecutive hours')
                            setTimeout(() => {
                                this.changeState("CALC")
                                return this.dispatch("calculating")
                            }, (ONE_HOUR / updateUnsold))
                        }
                        case pastDuration(): {
                            log('past duration')
                            this.changeState('CLOSE')
                            return this.dispatch('closing')
                        }
                        default: {
                            log('default :(')
                        }
                    }

                  },
                  
              },
              "TRANSFER": {
                  moving: async function() {

                    if(context.receivedQty <= 0){
                        log(name, {ID}, "NO BALANCE ---")
                        //wait... go back to start
                        return setTimeout(() => {
                            this.changeState("START")
                            this.dispatch("starting")
                        }, (ONE_MINUTE * 10))
                        //have this go to an idle state. wait. try go back to start??
                    }
                    let txid = await sendPayment(BittrexAddress, userAddress, context.receivedQty, coin)
                    
                    log(name, {ID}, txid)

                    if(txid){
                        context.currentTxid = txid;
                        context.bittrexTxid.push(txid)

                        setTimeout(async () => {
                            let { fees } = await getTxidInfo(BLOCK_EXPLORER, txid)
                            context.feeFloTx2 = fees;
                            context.bittrexBalance += (context.receivedQty - fees)
                            context.sellableQty = getSellableQty(context.totalQty, context.feeFloTx2);
                            log(name, {ID}, {fees, context})
                            this.changeState("WAIT")
                            this.dispatch("waiting")
                        }, 10000)
                    }
                  }
              },
              "WAIT": {
                  waiting: function() {
                      let timer = setInterval(async () => {
                        try {
                            
                            // let { confirmations } = await getTxidInfo(BLOCK_EXPLORER, context.bittrexTxid[context.bittrexTxid.length - 1])
                            let res = await checkBittrexDeposit(context.currentTxid)

                            let confirmations = res[0].confirmations

                            if(confirmations >= minConfirmations){
                                log("CONFIRMED", `${confirmations} out of ${minConfirmations}`)
                                clearInterval(timer)
                                this.changeState("CHECK_DEPOSIT")
                                this.dispatch("checkingDeposits")

                            } else {
                                log(name, {ID}, {confirmations})
                            }
                        } catch (error) {
                            log(error)
                        }
                      }, ONE_MINUTE )
                  }
              },
              "CHECK_DEPOSIT": {
                  checkingDeposits: async function() {
                    let depositInt = setInterval(async () => {
                        let res = await checkBittrexDeposit(context.currentTxid)

                        log("deposit", {res})

                        let order =  res.find(order => order.txId === context.currentTxid)

                        let bal = await confirmedBalance(context.bittrexTxid)
                         log('confirmed bal', bal)
                        context.confirmedBalance = bal - context.offsetBal

                        log({order})

                        let status = order.status

                        if(status === "COMPLETED") {
                            clearInterval(depositInt)
                            this.changeState("CALC")
                            this.dispatch("calculating")
                        } else {
                            log(name, {ID}, {res})
                        }
                    }, ONE_MINUTE)
                  }
              },
              "CALC": {
                calculating: async function() {
                    let bal = await confirmedBalance(context.bittrexTxid)
                    let feeFloTx1 = await getFees(BLOCK_EXPLORER, transactions);
                    context.feeFloTx1 = feeFloTx1
                    
                    context.confirmedBalance = bal - context.offsetBal

                    context.hourlyCostOfRentalBtc = Number((costOfRentalUsd / context.duration / priceBtcUsd).toFixed(8))
                    context.totalQty = getTotalQty(context.receivedQty, context.feeFloTx1)

                    let { fees } = await getTxidInfo(BLOCK_EXPLORER, context.bittrexTxid[context.bittrexTxid.length - 1])
                    context.feeFloTx2 = fees;
                    context.sellableQty = getSellableQty(context.totalQty, context.feeFloTx2);

                    let {
                        hourlyCostOfRentalBtc,
                        sellableQty,
                        bittrexTradeFee,
                        bittrexWithdrawlFee,
                        estFeeBtcTx1,
                        } = context

                    context.offerPriceBtc = getOfferPriceBtc(hourlyCostOfRentalBtc, bittrexTradeFee, margin, bittrexWithdrawlFee, estFeeBtcTx1, sellableQty)
                    log('offerPriceBtc', context.offerPriceBtc)



                    if(context.currentOrder){
                        this.changeState("UPDATE_UNSOLD")
                        this.dispatch("checkingStatus")
                    } else {
                        this.changeState("CREATE_OFFER")
                        this.dispatch("creatingOffer")
                    }

                }
              },
              "CREATE_OFFER": {
                creatingOffer: async function() {


                    
                    if(context.bittrexBalance >= MIN_TRADE_SIZE){
                        const res = await createSellOrder(token, context.bittrexBalance, context.offerPriceBtc);

                        if(res.success){
                            context.orders.push(res.result)
                            context.currentOrder = (res.result.uuid)
                            log(name, {ID}, context)
                            this.changeState("UPDATE_UNSOLD")
                            this.dispatch("checkingStatus")
                        } else {
                            log({res}, `---- TRY AGAIN LATER`, this.state);
                            this.changeState("START")
                            this.dispatch("starting")
                        }

                        
                    } else {
                        log(name, {ID}, {MIN_TRADE_SIZE}, '---- NOT MET', this.state)
                            this.changeState("START")
                            this.dispatch("starting")
                    }
                }
              },
              "UPDATE_UNSOLD": {
                    checkingStatus: async function() {
                        log('checkingSatus', this.state)

                        if(context.hour == 1){
                                this.changeState("LOOP")
                                this.dispatch("looping")
                                return;
                        }

                        log(name, {ID}, {context}, '--->.', this.state)

                        let orderStatus = await getOrder(context.currentOrder)

                        log(name, {ID}, {orderStatus})

                        if(orderStatus.fillQuantity == "0.00000000"){
                            return this.dispatch('notPartiallyMet', [{orderStatus}])
                        } else if (orderStatus.quantity == orderStatus.fillQuantity){
                            return this.dispatch("fullyMet", [{orderStatus}])
                        } else if (orderStatus.fillQuantity > 0){
                            return this.dispatch("partiallyMet", [{orderStatus}])
                        } else {
                            log(name, {ID}, "Uuh Ooh")
                        }

                    },
                    notPartiallyMet: async function({orderStatus}) {
                        log(name, {ID}, 'notPartiallyMet', this.state, orderStatus)

                        let tokenFromCancelledOffer = Number(orderStatus.quantity)
                        let costOfRentalFromCancelledOffer = context.hourlyCostOfRentalBtc * (context.hour - 1)
                        let costOfRentalBtcHour = context.hourlyCostOfRentalBtc;
                        let sellableQty = (tokenFromCancelledOffer + (context.receivedQty + context.feeFloTx1) - context.feeFloTx2)
                        let offerPriceBtc = Number((( 
                            ( costOfRentalFromCancelledOffer + costOfRentalBtcHour ) * ( context.bittrexTradeFee + 1 ) * (margin + 1 )
                             + ((CostOfWithdrawalPerCycleBTC + context.estFeeBtcTx1) / DURATION) ) / sellableQty).toFixed(8)
)
                        log(name, {ID}, {tokenFromCancelledOffer, costOfRentalFromCancelledOffer, sellableQty, offerPriceBtc})

                        let qty = context.confirmedBalance - context.offsetBal

                        log("UPDATE OFFER ----> ", offerPriceBtc)
                        let res = await updateOrder(context.currentOrder, token, qty, offerPriceBtc)
                            log({res})

                            if(res.success){
                                context.orders.push(res.result)
                                context.currentOrder = (res.result.uuid)
                                log(context)
                                this.changeState("LOOP")
                                this.dispatch("looping")
                        } else {
                                log({res})
                                log(name, {ID}, 'TRY AGAIN - LATER')
                                context.currentOrder = null;
                                this.changeState("START")
                                this.dispatch("starting")                      
                        }
                        

             },
                    partiallyMet: async function ({orderStatus}) {
                        log(name, {ID}, "MADE IT TO PARTIALLY_MET", {orderStatus})

                        let unsold = (orderStatus.quantity - orderStatus.fillQuantity)
                        let percentOfCancelledPartialOfferThatWasUnsold = unsold / context.totalQty
                        let costOfRentalFromPartialCancelledOffer = percentOfCancelledPartialOfferThatWasUnsold * context.hourlyCostOfRentalBtc * (context.hour - 1)
                        let costOfRentalBtcHour = context.hourlyCostOfRentalBtc
                        let sellableQty = (tokenFromCancelledOffer + (context.receivedQty + context.feeFloTx1) - context.feeFloTx2)
                        let offerPriceBtc = Number((( (
                            costOfRentalFromPartialCancelledOffer + costOfRentalBtcHour) * ( context.bittrexTradeFee + 1 ) * ( margin + 1 )
                             + ( ( CostOfWithdrawalPerCycleBTC + context.estFeeBtcTx1 ) / DURATION ) ) / sellableQty).toFixed(8))

                        let qty = unsold + context.bittrexBalance //!

                        log("UPDATE OFFER ----> ", offerPriceBtc)
                        let res = await updateOrder(context.currentOrder, token, qty, offerPriceBtc)
                           log(name, {ID}, {res})

                            if(res.success){
                            context.orders.push(res.result)
                            context.currentOrder = (res.result.uuid)
                            log(name, {ID}, context)
                            this.changeState("LOOP")
                            this.dispatch("looping")
                        } else {
                            log({res}, `---- HANDLE THIS`);
                            this.changeState("START")
                            this.dispatch("starting")   
                        }
                        
                    },
                    fullyMet: async function ({orderStatus}) {
                        log("MADE IT TO FULLY MET", {orderStatus})

                        let offerPriceBtc = getOfferPriceBtc(context.hourlyCostOfRentalBtc, context.bittrexTradeFee, margin, context.bittrexWithdrawlFee, 
                            context.estFeeBtcTx1, context.sellableQty)
                        
                        context.offerPriceBtc = offerPriceBtc;
                        context.completedOrders.push(context.currentOrder)
                        context.currentOrder = null;
                        context.offsetBal += Number(orderStatus.quantity)

                        context.btcFromOrders = await getBtcBalance(context.completedOrders)
                        let bal = await confirmedBalance(context.bittrexTxid)
                        context.bittrexBalance = bal - context.offsetBal
                        context.confirmedBalance = bal - context.offsetBal
                        context.totalQty = 0;
                        context.receivedQty = 0;
                        context.sellableQty = 0;

                      log(name, {ID}, {context}, '----------')



                        log(name, {ID}, "CREATE OFFER ----> ", offerPriceBtc)
                        this.changeState("CREATE_OFFER")
                        this.dispatch("creatingOffer")                        

                    }
              },
              "LOOP": {
                looping: function() {
                    log(name, {ID}, {context}, Date.now())
                    this.changeState('START')
                    this.dispatch('starting')
                }
              },
              "CLOSE": {
                  closing: async function() {

                        clearInterval(pushTokensInt)

                        context.btcFromOrders = await getBtcBalance(context.completedOrders)

                        // profitUsd = (btcFromTrade * priceCoinbaseUsdBtc) - costOfRentalUsd
                        // takeProfitBtc = profitUsd * (1 - profitReinvestmentRate) / priceCoinbaseUsdBtc

                        this.changeState('WITHDRAWL')
                        this.dispatch('withdrawing')

                  }
              },
              "WITHDRAWL": {
                withdrawing: async function() {
                    //Move btc to HDMW

                    //Move takeProfitBtc to coinbase

                    //Move left over btcFromTrade back to rental provider.
                    try {
                        let sentToHDMW = await withdrawFromBittrex('BTC', context.btcFromOrders, rentalAddress);
                        log(name, {ID}, {sentToHDMW})

                        if(sentToHDMW.success){
                            this.changeState('RESULTS')
                            this.dispatch('results')
                        }
                    } catch (error) {
                        log(error)
                    }
                }
              },

              "RESULTS": {
                  results: function() {
                      postResults({
                        ID, _id, 
                        timestarted: context.startTime, 
                        costOfRentalBtc: CostOfRentalBtc, 
                        duration: DURATION,
                        priceBtcUsd: priceBtcUsd,
                        btcFromTrades: context.btcFromOrders, 
                        totalMined: context.offsetBal, 
                        profitReinvestment: reinvestmentRate, 
                        completedOrders: context.completedOrders,
                        bittrexTxid: context.bittrexTxid,
                        currentOrder: context.currentOrder,
                        currentTxid: context.currentTxid,
                        commission: context.bittrexWithdrawlFee,
                        openOrders: context.currentOrder
                    })
                  }
              },
              "ERROR": {
                  nothing: async function() {
                      return "!COOLBEANS :( "
                  }
              }
          },
          dispatch (actionName, ...payload) {
              const actions = this.transitions[this.state];
              const action = this.transitions[this.state][actionName]

              if(action){
                  action.apply(machine, ...payload);
              } else {
                  log('not valid for current state ---', 'from: ' + this.state, 'to:', {actionName, ...payload})
              }
          },
          changeState(newState){
              log(name, {ID}, 'STATE ---[', newState, ']' )
              this.state = newState;
          }
      }

      let Trade = Object.create(machine, {
          name: {
              writable: false,
              enumerable: true,
              value: 'Trade'
          }
      })

      log("CURRENT STATE ---", Trade.state)
      Trade.dispatch("starting")

      let pushTokensInt = setInterval(() => {
          pushTokensToBittrex()
      }, (ONE_HOUR))



    return;
}
