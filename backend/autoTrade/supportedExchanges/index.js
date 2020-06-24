require('dotenv').config();
const { API_URL}  = process.env
const { Account, Address, TransactionBuilder, Networks } = require('@oipwg/hdmw')
const bip32 = require('bip32')
const axios = require('axios')
const { timestamp } = require('../../helpers/timestamp')
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
let Confirms = 0;
let btc = 0;



module.exports = async function(profile, accessToken, wallet, rentalAddress) {

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

    // formulas
    const getTotalQty = (ReceivedQty, FeeFloTx1) => {
        return Number((ReceivedQty + FeeFloTx1).toFixed(8));
    }

    const getOfferPriceBtc = (CostOfRentalBTC, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2) => {
        let OfferPrice =  ( CostOfRentalBTC * ( TradeFee + 1 ) * ( margin + 1 ) + CostOfWithdrawalPerCycleBTC + EstFeeBtcTx1 ) / ( TotalQty - FeeFloTx2 )
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
            console.log(timestamp(),'getBittrexAddress Failed ------- ', error)
        }
    }

    const getBalanceFromAddress = async (address) => {
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

        if((!(market && quantity && rate))){
            return console.log(timestamp(),'Failed', {market, quantity, rate})
        }

        rate = await checkMarketPrice(rate);

        let body = {
            orderUuid,
            market,
            quantity,
            rate,
        }

        
        console.log(timestamp(),body)

        try {
            const res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)
            return res.data
        } catch (error) {
            console.log(timestamp(),'updateOrder ---', error)
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

    const getCoinbaseBTCUSD = async () => {
        try {
            const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC')

            return Number(response.data.data.rates.USD)
            
        } catch (error) {
            console.log(timestamp(),'Err; getCoinbaseBTCUSD -----', error)
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
    
            let builder2 = new TransactionBuilder(Networks.flo, {
                from: addressObj,
                to: {[floBittrexAddress]: adjustedAmount}
            }, account)
    
    
            let inNOuts = await builder2
                    .buildInputsAndOutputs()
                    .then((calculated) => {
                        return calculated;
            })
        
            return (inNOuts.fee * MIN_FEE_PER_BYTE)
        } catch (error) {
            console.log(timestamp(),'ERR; builTransaction ------', error)
        }

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

    const timeStarted = Date.now()

    let userBTCAddress = address.btcAddress;
    CostOfRentalBTC = CostOfRentalBtc

    address = address.publicAddress;
    console.log(timestamp(), 'START AUTO TRADE', {timeStarted, address, userBTCAddress, rentalAddress})

    if(!address){
        console.log(timestamp(),'no address')
        return 'No Address'
    }

    const margin = targetMargin / 100;
    const ProfitReinvestmentRate = profitReinvestment / 100;


    const accountMaster = bip32.fromBase58(wallet.flo.xPrv, Networks.flo.network)
    let account = new Account(accountMaster, Networks.flo);

    account.discoverChains();

    let {balance, transactions} = await getBalanceFromAddress(address);
    const floBittrexAddress = await getBittrexAddress(token);

            
        if(transactions){
            FeeFloTx1 = await getFees(transactions)
        } else {
            FeeFloTx1 = 0;
        }
            ReceivedQty = balance
            TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)


            console.log(timestamp(),'pre call -----', {ReceivedQty, FeeFloTx1, TotalQty, floBittrexAddress})
    
    let bittrexTX

            if(balance > 0) {
                FloTradeFee = await buildTransaction(address, ReceivedQty)
                let sendAmount = Number((ReceivedQty - (FloTradeFee)).toFixed(8))
                console.log(timestamp(),'sending to bittrex: 1', {sendAmount, FloTradeFee})
                try {
                    bittrexTX = await account.sendPayment({
                        to: {[floBittrexAddress]: sendAmount},
                        from: address,
                        discover: false
                    })
                    totalSent += sendAmount
                } catch (error) {
                    console.log(timestamp(),'failed to send, will try again', error)
                }

            }

            if(bittrexTX){
                console.log(timestamp(),{bittrexTX})
            }

                let isUpdate = false;


                const checkConfirmations = async () => {
                    try {

                        console.log(timestamp(),'running checkConfirmation()...')

                        if(!bittrexTX){
                            return console.log(timestamp(),'no bittrexTx')
                        }

                        let res = await axios.get(`https://livenet.flocha.in/api/tx/${bittrexTX}`)

                        if(res.status != 200){
                            return console.log(timestamp(),res)
                        }



                        let {fees, confirmations } = res.data
                        Confirms = confirmations;

                        FeeFloTx2 = fees
                        EstFeeBtcTx1=0.00001551 //! get from somewhere
            
                        TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                        SellableQty = getSellableQty(TotalQty, FeeFloTx2)               
                        OfferPriceBtc = getOfferPriceBtc(CostOfRentalBTC, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1,TotalQty,FeeFloTx1,FeeFloTx2)
                        OfferPrice24h = get24hOfferPriceBtc(0, CostOfRentalBTC, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, SellableQty)
                        console.log(
                                timestamp(),
                                '---check confirmations---',
                                { 
                                    confirmations,
                                    TotalQty,
                                    FeeFloTx1,
                                    FeeFloTx2,
                                    SellableQty,
                                    FeeFloTx2, 
                                    CostOfRentalBTC,
                                    TradeFee,
                                    margin,
                                    EstFeeBtcTx1,
                                    TotalQty,
                                    FeeFloTx1,
                                    FeeFloTx2,
                                    OfferPriceBtc,
                                    OfferPrice24h,
                                    totalSent
                                }
                            )
    
                        // bittrex needs 150 confirmations 
                        if(Confirms > 150){
                            if(isUpdate){

                               

                                    TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                                    SellableQty  = getSellableQty(TotalQty, FeeFloTx2)
                                    OfferPriceBtc = getOfferPriceBtc(CostOfRentalBTC, TradeFee, margin, CostOfWithdrawalPerCycleBTC, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2);
    
                                    console.log(
                                        timestamp(),
                                        '---Updated---',
                                        { 
                                            TotalQty,
                                            FeeFloTx1,
                                            FeeFloTx2,
                                            SellableQty,
                                            FeeFloTx2, 
                                            CostOfRentalBTC,
                                            TradeFee,
                                            margin,
                                            EstFeeBtcTx1,
                                            TotalQty,
                                            FeeFloTx1,
                                            FeeFloTx2,
                                            OfferPriceBtc,
                                            totalSent
                                        })

                                    console.log(timestamp(),'If Update --- before runing function;', {SellableQty, OfferPriceBtc})
                            }

                            if(orderReceiptID){
                                
                                Confirms = 0;
                                const res = await updateOrder(orderReceiptID, token, totalSent, OfferPriceBtc)
                                if(res.success){
                                    orderReceiptID = res.result.uuid;
                                    checkOrderStatus()
                                    bittrexTX=null;
                                    console.log(timestamp(),'updateOrder ---', {res, orderReceiptID})
                                    return BtcFromTrades =  await getSalesHistory(token, orderReceiptID);
                                } else {
                                    console.log(res)
                                    bittrexTX=null;
                                }
                            } else {

                                const res = await createSellOrder(token, totalSent, OfferPriceBtc)
                                if(res.success){
                                    orderReceiptID = res.result.uuid
                                    Confirms = 0;
                                    checkOrderStatus()
                                    bittrexTX=null;
                                    console.log(timestamp(),'createSellOrder ---', {res, orderReceiptID})
                                    BtcFromTrades = await getSalesHistory(token, orderReceiptID);
                                } else {
                                    console.log(res)
                                    bittrexTX=null;
                                }
                            }
                        }}
                    catch (error) {
                        console.log(timestamp(),'EER; checkConfirmations ------', error)
                    }

                    
                }
    


                    // BtcFromTrades = cumulative total of Bitcoin earned from trades;
                    // PriceBtcUsd = Coinbase's API - current exchange price for BTC in USD;
                    // ProfitUsd = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd

                const shouldIUpdated = async () => {
                    try {
                        console.log(timestamp(),'runing shouldIUpdate()...')
                        const res = await getBalanceFromAddress(address);

                        if(!res) return;

                        updatedBalance = res.balance
                        transactions = res.transactions

                        if(bittrexTX) return;


                        if(updatedBalance > 0){
                            FeeFloTx1 = await getFees(transactions)
                            console.log(timestamp(),'pre', {balance, updatedBalance, FeeFloTx1})
                            isUpdate = true;

                            //push new tokens to wallet
                            FloTradeFee = await buildTransaction(address, updatedBalance)
                            console.log(timestamp(),{FloTradeFee})
                            if(!FloTradeFee || (typeof FloTradeFee != 'number')) return;

                            let sendAmount = Number((updatedBalance - FloTradeFee).toFixed(8))
                            console.log(timestamp(),'sending to bittrex: 2', {sendAmount})

                            try {
                                bittrexTX = await account.sendPayment({
                                    to: {[floBittrexAddress]: sendAmount},
                                    from: address,
                                    discover: false
                                })
                                totalSent += sendAmount
                                ReceivedQty += updatedBalance;
                                console.log({bittrexTX})
                            } catch (error) {
                                console.log(timestamp(),'failed to send, will try again', error)
                            }

                        } else {
                            console.log(timestamp(),'Not enought to send to Bittrex', updatedBalance)

                        }
                    } catch (error) {
                        console.log(timestamp(),error)
                    }
                }

            const checkOrderStatus = async () => {

                console.log('Running checkOrderStatus().....', {orderReceiptID})
                if(!orderReceiptID){
                    return console.log({orderReceiptID})
                }

                let BtcFromTrades = await getSalesHistory(token, orderReceiptID)

                if(BtcFromTrades){
                    console.log(timestamp(), {orderReceiptID}, 'CLOSED')
                    totalSent=0;
                    TotalQty=0;
                    SellableQty=0;
                    OfferPriceBtc=0;
                    orderReceiptID=''
                    BtcFromTrades += BtcFromsPartialTrades;
                    btc += BtcFromTrades;

                    
                    PriceBtcUsd = await getCoinbaseBTCUSD();
                    CostOfRentalUsd = CostOfRentalBTC * PriceBtcUsd
                    
                    ProfitUsd = getProfitUsd(BtcFromTrades, PriceBtcUsd, CostOfRentalUsd)
                    
                    RentalBudget3HrCycleUsd = getRentalBudget3HrCycleUsd(CostOfRentalUsd, ProfitUsd, ProfitReinvestmentRate);
                    
                    RentalBudgetDailyUsd = getRentalBudgetDailyUsd(RentalBudget3HrCycleUsd);
                    TakeProfitBtc = getTakeProfitBtc(ProfitUsd, ProfitReinvestmentRate, PriceBtcUsd)

                    console.log(
                        timestamp(),
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
                    
                    }
                    )

                    console.log(`24hr`, {timeStarted}, Date.now(), (Date.now() > (timeStarted + (24 * ONE_HOUR))))

                    if(Date.now() > (timeStarted + (24 * ONE_HOUR))){ 
                        console.log(timestamp(),'Withdraw from bittrex ---')
                        let sentToHDMW = await withdrawFromBittrex('BTC', btc, rentalAddress);
                        console.log(timestamp(),'sentToMRR ---', sentToHDMW)
                        clearAllIntervals(timer, update, orderStatus);
                        let res = await axios.get(`https://blockchain.info/q/getblockcount`)
                        currentBlockCount = res.data
                        console.log(timestamp(),{currentBlockCount})    
                        checkBlock = setInterval(() => {     
                            checkBlockStatus(currentBlockCount)
                        }, (15 * ONE_MINUTE))

                    } 
                    
                }
            }


            const checkBlockStatus = async (blocks) => {    
                console.log(timestamp(),"checking blockstatus...", {currentBlockCount})

                let res = await axios.get(`https://blockchain.info/q/getblockcount`)
                
                if(!res.data){
                    return;
                }

                let blockCount = res.data

                console.log(timestamp(),{blockCount})

                if(((blocks + 3) < blockCount)){
                    console.log(timestamp(),'starting rental again.')
                    this.clearInterval(checkBlock)
                    return rent(profile)
                }
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

            const clearAllIntervals = (timer, update, orderStatus) => {
                    console.log(timestamp(), '--- TRADE END ---')
                    this.clearInterval(timer)
                    this.clearInterval(update)
                    this.clearInterval(orderStatus)
            }

}