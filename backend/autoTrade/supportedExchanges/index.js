require('dotenv').config();
const StateMachine = require('javascript-state-machine');
const { API_URL}  = process.env
const timestamp = require('../../helpers/timestamp')
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
    getMinTradeSize
} = require('./func')
const { Account, Address, TransactionBuilder, Networks } = require('@oipwg/hdmw')
const bip32 = require('bip32')
const axios = require('axios')


const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const MIN_FEE_PER_BYTE = 0.00000001

let TotalQty  = 0; //Receviced + FeeFloTx1
let ReceivedQty; //what is deposited from rentals
let FeeFloTx1; //cumulative fee from rentals.
// These values come from what resulted in the rentals;

let SellableQty; //Qty to sell; TotalQty - FeeFloTx2
let FeeFloTx2; //Fee from moving tokens from Local Wallet to Bittrex

let  OfferPriceBtc, //formula 
     CostOfRentalBTC, //comes from rental
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

let TokensFromCanOffer,
    costOfRentalFromCanOffer,
    costOf

module.exports = async function(profile, accessToken, wallet, rentalAddress) {
    
    // //Todo: Pass this to into Trade function
    // if(token === 'FLO'){
    //     var blockHeight = getBlockHeightFlo
    // } else if(token === 'RVN'){
    //     blockHeight = getBlockHeightFlo
    // }


    if(!accessToken){
        console.log(timestamp(),'no access token');
        return 'ERROR; No Access Token'
    }
    if(!profile){
        console.log(timestamp(),'no profile');
        return 'ERROR; Profile Not Found'
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': accessToken
        },
    };


    //bittrex wallet address
    const getBittrexAddress = async (token) => {
        try {
            
            let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

            if(res.status != 200){

            }

            return res.data.bittrexAddresses[token].Address

        } catch (error) {
            console.log(timestamp(),'getBittrexAddress Failed ------- ', error)
        }
    }

    const createSellOrder = async (market, quantity, rate) => {

        if((!(market && quantity && rate))){
            return console.log(timestamp(),'Failed', {market, quantity, rate})
        }

        rate = await checkMarketPrice(rate);

                
        let body = {
            market,
            quantity,
            rate,
        }
        
        console.log(timestamp(),'running createSellOrder -------', body)


        try {
            const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)

            return res.data;
        } catch (error) {
            console.log(timestamp(),'error ---', error)
        }
        
    }

    const updateOrder = async (orderUuid, market, quantity, rate) => {
        rate = await checkMarketPrice(rate);

        //check to see if order has been partially sold.
        const order = await getOrder(orderUuid)
        console.log(timestamp(), {order})

        // if partially filled remove for rate - already acounter for in totalSent
        const amountSold = Number((order.Quantity - order.QuantityRemaining).toFixed(8))
        BtcFromsPartialTrades = Number((order.Price - order.CommissionPaid).toFixed(8))

        console.log(timestamp(), {BtcFromsPartialTrades})

        quantity -= amountSold;

        let body = {
            orderUuid,
            market,
            quantity,
            rate,
        }

        
        console.log(timestamp(),body)

        try {
            const res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)
            return res.data.result.uuid
        } catch (error) {
            console.log(timestamp(),'updateOrder ---', error)
        }
    }
    
    const getSalesHistory = async (token, id) => {
        try {
            if(!id){
                return console.log(timestamp(), 'no:', {id})
            }

            const res = await axios.get(`${API_URL}/bittrex/salesHistory`, config)


            let {salesHistory} = res.data;

            console.log(timestamp(), {id})

            const orderCompleted = salesHistory.find(el => el.OrderUuid === id)

            if(orderCompleted){
                return Number((orderCompleted.Price - orderCompleted.Commission).toFixed(8))
            } else return;

        } catch (error) {
            console.log(timestamp(),'ERR; getSalesHistory ----', error)
        }
    }

    const getOrder = async (orderUuid) => {
        try {
            const res = await axios.get(`${API_URL}/bittrex/openOrders`, config)

            const openOrders = res.data;

            const order = openOrders.find(order => order.OrderUuid === orderUuid)

            return order;
        } catch (error) {
            console.log(timestamp(),'ERR; getOpenOrders ----', error)
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

            console.log(timestamp(), {body})
            let res = await axios.post(`${API_URL}/bittrex/withdraw`, body, config)
        
            return res.data;

        } catch (error) {
            console.log(timestamp(),'ERR; withDrawFromBittrex -----', error)
        }
    }

    const buildTransaction = async (address, amount) => {
        try {
            let addressObj = new Address(address, Networks.flo, false);

            let builder = new TransactionBuilder(Networks.flo, {
                from: addressObj,
                to: {[floBittrexAddress]: amount}
            }, account)
            
            
            let iof = await builder
                    .buildInputsAndOutputs()
                    .then((calculated) => {
                        console.log(calculated.inputs)
                        console.log(calculated.outputs)
                        console.log(calculated.fee)
                        return calculated;
            })
    
    
            let fee = iof.fee * MIN_FEE_PER_BYTE;

            const adjustedAmount = Number((amount - fee).toFixed(8))

            console.log(timestamp(),{adjustedAmount})
    
    
            let builder2 = new TransactionBuilder(Networks.flo, {
                from: addressObj,
                to: {[floBittrexAddress]: adjustedAmount}
            }, account)
    
    
            let inNOuts = await builder2
                    .buildInputsAndOutputs()
                    .then((calculated) => {
                        return calculated;
            })
        
    
            // let rawtx = inNOuts.inputs.map((x) => {
            //     return x.rawtx.length
            // })

            // let bytes = rawtx.reduce((a, b) => a + b)
            // console.log({bytes})

    
            // let finalFee = ((bytes / 2) * minFeePerByte)
            // console.log({finalFee})
    
            return (inNOuts.fee * MIN_FEE_PER_BYTE)
        } catch (error) {
            console.log(timestamp(),'ERR; builTransaction ------', error)
        }

    }

    const rent = (options) => { 

        let body = {
            targetMargin: options.targetMargin,
            profitReinvestment: options.profitReinvestment,
            updateUnsold: options.updateUnsold,
            dailyBudget: options.dailyBudget,
            autoRent: options.autoRent.on,
            spot: options.autoRent.mode.spot,
            alwaysMineXPercent: options.autoRent.mode.alwaysMineXPercent.on,
            autoTrade: options.autoTrade.on,
            morphie: options.autoTrade.mode.morphie,
            supportedExchange: options.autoTrade.mode.supportedExchanges,
            Xpercent: options.autoRent.mode.alwaysMineXPercent.Xpercent,
            token: options.token,
            message: options.message,
            update: false,
            to_do: 'rent',
            profile_id: options._id
        }
        
        axios.post(API_URL+'/rent',
            body,
            config
        ).then((response) => {
            console.log(timestamp(),response)
        }).catch((err)=> {
            console.log(timestamp(),err)
        })
    }


    const confirmBittrexDeposit = async (txid) => {
        try { 
            const res = await axios.get(`${API_URL}/bittrex/deposit-history`, config)
            let deposits = res.data.result;

            let found = deposits.find(deposit => deposit.TxId === txid)

            return found; 

        } catch (error) {
            console.log(error)
        }
    }

    const sendPayment = async (floBittrexAddress, address, amount) => {
        try {

            if(amount <= 0){
                return " ----------- NO BALANCE -------------"
            }

            let fee = await buildTransaction(address, amount)

            let sendAmount = Number((amount - (fee)).toFixed(8))

            // let txid = await account.sendPayment({
            //     to: {[floBittrexAddress]: sendAmount},
            //     from: address,
            //     discover: false
            // })

            // console.log({txid})
            let txid = 'b5a7ab72c82efd98b28f837e1760c7cc1f752782f2cb9c9add73eea2588d444a'

            return txid

            
        } catch (error) {
            console.log(timestamp(), "ERR; SendPayment", error)
        }
    }
    
    // ------------  START -------------- 
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

    //! TESTING
        CostOfRentalBtc = 0.00084804
        let price = await getCoinbaseBTCUSD()
        let priceBtcAtStart = await getCoinbaseBTCUSD()
    //! TESTING

    if(!profile){
        console.log(profile, 'not found')
        return 'no profile found'
    }

    const coin = token.toLowerCase();

    const accountMaster = bip32.fromBase58(wallet[coin].xPrv, Networks[coin].network)
    let account = new Account(accountMaster, Networks[coin]);
    // account.discoverChains();
    const margin = targetMargin / 100;
    const reinvestmentRate = profitReinvestment / 100;
    const floBittrexAddress = await getBittrexAddress(token);
    const costOfRentalUsd = CostOfRentalBtc * price

    let userBTCAddress = address.btcAddress;
    let userFLOAddress = address.publicAddress;
    console.log(timestamp(), 'START AUTO TRADE', {userFLOAddress, userBTCAddress, rentalAddress})

    if(!address){
        console.log(timestamp(),'no address')
        return 'No Address'
    }

    let context = {
        duration: 3,
        hour: 1,
        blockHeight: 0,
        receivedQty: 0,
        feeFloTx1: 0,
        hourlyCostOfRentalBtc: 0,
        totalQty: 0,
        feeFloTx2: 0,
        sellableQty: 0,
        bittrexTradeFee: 0.002,
        bittrexWithdrawlFee: .0005,
        estFeeBtcTx1: 0.00001551,
        offerPriceBtc: 0,
        offerPriceBtc24h: 0,
        bittrexTxid: [],
        orders: [],
        statTime: Date.now()
      }

      console.log({costOfRentalUsd, priceBtcAtStart})


      const machine = {
          state: "START",
          transitions: {
              "START": {
                  starting: async function() {
                    console.log('Staring...')
                    //! 



                    //!
                    let {balance, transactions} = await getBalanceFromAddress(userFLOAddress)
                    let fees = await getFees(transactions);
                    context.receivedQty = balance
                    context.feeFloTx1 = fees
                    context.hourlyCostOfRentalBtc = Number((costOfRentalUsd / context.duration / priceBtcAtStart).toFixed(8))
                    context.totalQty = getTotalQty(context.receivedQty, context.feeFloTx1)
                    console.log(context)
                    this.changeState('TRANSFER')
                    this.dispatch('moving')
                  }
              },
              "TRANSFER": {
                  moving: async function() {

                    if(context.receivedQty <= 0){
                        return console.log("NO BALANCE --- HANDLE THIS STATE ")
                    }
                    let txid = await sendPayment(floBittrexAddress, userFLOAddress, context.receivedQty)
                    
                    console.log(txid)

                    if(txid){
                        context.bittrexTxid.push(txid)

                        setTimeout(async () => {
                            let { fees } = await getTxidInfo(txid)
                            context.feeFloTx2 = fees;
                            context.sellableQty = getSellableQty(context.totalQty, context.feeFloTx2);
                            console.log({fees, context})
                            this.changeState("WAIT")
                            this.dispatch("waiting")
                        }, 10000)
                    }
                  }
              },
              "WAIT": {
                  waiting: function(add) {
                      let timer = setInterval(async () => {
                        try {
                            
                            let minConfirmation = 150

                            if(token === "RVN"){
                                minConfirmation = 60
                            }
                            
                            if(add){
                                minConfirmation += add;
                            }


                            let { confirmations } = await getTxidInfo(context.bittrexTxid[context.bittrexTxid.length - 1])

                            if(confirmations > minConfirmation){
                                console.log("CONFIRMED", `${confirmations} out of ${minConfirmation}`)
                                clearInterval(timer)
                                this.changeState("CHECK_DEPOSIT")
                                this.dispatch("checkingDeposits")
                            } else {
                                console.log({confirmations})
                            }
                        } catch (error) {
                            console.log(error)
                        }
                      }, ONE_MINUTE)
                  }
              },
              "CHECK_DEPOSIT": {
                  checkingDeposits: async function() {

                    let confirmed = await confirmBittrexDeposit(context.bittrexTxid[context.bittrexTxid.length - 1])

                    console.log("deposit", {confirmed})

                    if(confirmed) {
                        this.changeState("CALC")
                        this.dispatch("calculating")
                    } else {
                        this.changeState("WAIT")
                        this.dispatch("waiting", [{add: 10}])
                    }
                  }
              },
              "CALC": {
                calculating: function() {
                    let {
                        hourlyCostOfRentalBtc,
                        sellableQty,
                        bittrexTradeFee,
                        bittrexWithdrawlFee,
                        estFeeBtcTx1,
                        } = context
                    context.offerPriceBtc = getOfferPriceBtc(hourlyCostOfRentalBtc, bittrexTradeFee, margin, bittrexWithdrawlFee, estFeeBtcTx1, sellableQty)
                    this.changeState("CREATE_OFFER")
                    this.dispatch("creatingOffer")
                }
              },
              "CREATE_OFFER": {
                creatingOffer: async function() {
                    let min = await getMinTradeSize(token)
                    
                    if(context.receivedQty >= min){
                        const res = await createSellOrder(token, context.receivedQty, context.offerPriceBtc);

                        if(res.success){
                            context.orders.push(res.result)
                            console.log(context)
                            this.changeState("UPDATE_UNSOLD")
                            this.dispatch("checkingStatus")
                        } else {
                            console.log({res}, `---- HANDLE THIS`);
                            // this.changeState("")
                        }

                        
                    } else {
                        return console.log('MINNIMUM NOT MET -----  HANDLE THIS', {min})
                    }


                }
              },
              "UPDATE_UNSOLD": {
                    checkingStatus: async function() {
                        console.log('checkingSatus')

                        if(context.hour === 1){
                            return setTimeout(() => {
                                console.log("BRUHAHAHA")
                                this.changeState("LOOP")
                                this.dispatch("looping")
                            }, 5000) //! ONE_HOUR
                            
                        }

                        let orderStatus = await getOrder(context.orders[context.orders.length - 1].uuid)

                        if(orderStatus.QuantityRemaining === context.receivedQty){
                            return this.dispatch('notPartiallyMet', [{orderStatus}])
                        } else if (orderStatus.QuantityRemaining < orderStatus.Quantity){
                            return this.dispatch("partiallyMet", [{orderStatus}])
                        } else if (orderStatus.QuantityRemaining === 0){
                            return this.dispatch("fullyMet", [{orderStatus}])
                        } else {
                            console.log("Uuh Ooh")
                        }


                        //when timer is done should run 
                        // //todo: continue loop
                        // this.changeState("LOOP")
                        // this.dispatch("looping")

                    },
                    notPartiallyMet: function({orderStatus}) {
                        console.log('notPartiallyMet')

                        const tokenFromCancelledOffer = orderStatus.QuantityRemaining
                        const costOfRentalFromCancelledOffer = context.hourlyCostOfRentalBtc * (context.hour - 1)
                        const costOfRentalBtcHour = context.hourlyCostOfRentalBtc;
                        const sellableQty = (tokenFromCancelledOffer + (context.receivedQty + context.feeFloTx1) - context.feeFloTx2)
                        let offerPriceBtc = ( 
                            ( costOfRentalFromCancelledOffer + costOfRentalBtcHour ) * ( context.bittrexTradeFee + 1 ) * (margin + 1 )
                             + ((CostOfWithdrawalPerCycleBTC + context.estFeeBtcTx1) / 24) ) / sellableQty

                        console.log({tokenFromCancelledOffer, costOfRentalFromCancelledOffer, sellableQty, offerPriceBtc})

                        console.log("UPDATE OFFER ----> ", offerPriceBtc)
                        

             },
                    partiallyMet: function ({orderStatus}) {
                        console.log("MADE IT TO PARTIALLY_MET", {orderStatus})

                        const unsold = context.QuantityRemaining
                        const percentOfCancelledPartialOfferThatWasUnsold = unsold / context.totalQty
                        const costOfRentalFromPartialCancelledOffer = percentOfCancelledPartialOfferThatWasUnsold * context.hourlyCostOfRentalBtc * (context.hour - 1)
                        const costOfRentalBtcHour = context.hourlyCostOfRentalBtc
                        const sellableQty = (tokenFromCancelledOffer + (context.receivedQty + context.feeFloTx1) - context.feeFloTx2)
                        let offerPriceBtc = ( (
                            costOfRentalFromPartialCancelledOffer + costOfRentalBtcHour) * ( context.bittrexTradeFee + 1 ) * ( margin + 1 )
                             + ( ( CostOfWithdrawalPerCycleBTC + context.estFeeBtcTx1 ) / 24 ) ) / sellableQty;

                        console.log("UPDATE OFFER ----> ", offerPriceBtc)
                    },
                    fullyMet: function ({orderStatus}) {
                        console.log("MADE IT TO FULLY MET", {orderStatus})

                        const offerPriceBtc = getOfferPriceBtc(hourlyCostOfRentalBtc, bittrexTradeFee, margin, bittrexWithdrawlFee, estFeeBtcTx1, sellableQty)
                        console.log("CREATE OFFER ----> ", offerPriceBtc)

                    }
              },
              "LOOP": {
                looping: function() {
                    console.log("LOOOPPPPINGGGGGGG!!", {context}, Date.now())

                    if(context.hour < context.duration){
                        context.hour += 1;
                        this.changeState('START')
                        this.dispatch('starting')
                    } else {
                        this.changeState('CLOSE')
                        this.dispatch('closing')
                    }
                }
              },

              "CLOSE": {
                  closing: function() {
                    console.log("do some stuff...like calculating....and then withdraw")

                    //todo: if 23 hours after the rental started
                    /**
                     * check cumulative total of Btc that resulted from all trades which have closed on Bittrex
                        btcFromTrade = cumulativeBtc

                        calculate
                        profitUsd = (btcFromTrade * priceCoinbaseUsdBtc) - costOfRentalUsd
                        takeProfitBtc = profitUsd * (1 - profitReinvestmentRate) / priceCoinbaseUsdBtc

                        this.change(WITHDRAWL)


                     */

                  }
              },
              "WITHDRAWL": {
                withdraw: function() {
                    //Move btc to HDMW

                    //Move takeProfitBtc to coinbase

                    //Move left over btcFromTrade back to rental provider.
                }
              },



              "ERROR": {
                  nothing: async function() {
                      return "NOT COOLBEANS :( "
                  }
              }
          },
          dispatch (actionName, ...payload) {
              const actions = this.transitions[this.state];
              const action = this.transitions[this.state][actionName]

              if(action){
                  action.apply(machine, ...payload);
              } else {
                  console.log('not valid for current state')
              }
          },
          changeState(newState){
              console.log('STATE ---', newState, '---' )
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

      console.log("CURRENT STATE ---", Trade.state)
      Trade.dispatch("starting")

    return;
}
