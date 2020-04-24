//todo: grab - shoot down user's menemonic to access said wallet.
// ? Ask user to enter password; if wallet is unlocked?
require('dotenv').config();
const { API_URL}  = process.env
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet
const axios = require('axios')

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
let TotalQty  = 0; //Receviced + FeeFloTx1
let ReceivedQty; //what is deposited from rentals
let FeeFloTx1; //cumulative fee from rentals.
// These values come from what resulted in the rentals;

let SellableQty; //Qty to sell; TotalQty - FeeFloTx2
let FeeFloTx2; //Fee from moving tokens from Local Wallet to Bittrex

let  OfferPriceBtc, //formula 
     CostOfRentalBTC, //comes from rental
     TradeFee, //?
     EstFeeBtcTx1, //?
     BtcFromTrades = 0,
     PriceBtcUsd,
     ProfitUsd,// = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
     RentalBudget3HrCycleUsd,
     CostOfRentalUsd

const CostOfWithdrawalPerCycleBTC = .0005;



module.exports = async function(profile, mnemonic, accessToken) {

    if(!accessToken){
        console.log('no access token');
        return 'ERROR; No Access Token'
    }
    if(!profile){
        console.log('no profile');
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
        return (ReceivedQty + FeeFloTx1);
    }

    const getOfferPriceBtc = (CostOfRentalBTC, TradeFee, margin, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2) => {
        let OfferPrice =  ( CostOfRentalBTC * ( TradeFee + 1 ) * ( margin + 1 ) + CostOfWithdrawalPerCycleBTC + EstFeeBtcTx1 ) / ( TotalQty - FeeFloTx1 - FeeFloTx2 )
        return Number(OfferPrice.toFixed(8))
    }

    const getSellableQty = (TotalQty, FeeFloTx2) => {
        return TotalQty - FeeFloTx2
    }

    //bittrex wallet address
    const getBittrexAddress = async (token) => {
        try {
            
            let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

            return res.data.bittrexAddresses[token].Address

        } catch (error) {
            console.log('getBittrexAddress Failed ------- ', error)
        }
    }

    const getBalanceFromAddress = async (address) => {
        try {
            let res = await axios.get(`https://livenet.flocha.in/api/addr/${address}`)

            return res.data    
        } catch (error) {
            console.log('error -------', error)
        }
    }

    const send_a_payment = async (address, amount) => {
        try {
            let txid = await myWallet.sendPayment({
                to: { [address]: amount }
            })
            console.log("Successfully sent Transaction! " + txid);
            return txid

        } catch (error) {
            console.log('error -----', error)
        }
    }

    const createSellOrder = async (market, quantity, rate) => {
                
        let body = {
            market,
            quantity,
            rate,
        }
        
        console.log('running createSellOrder -------', body)

        try {
            const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)
            console.log(res.data)
            if(res.data.success){
                return res.data.result.uuid
            }
        } catch (error) {
            console.log('error ---', error)
        }
        
    }

    const updateOrder = async (orderUuid, market, quantity, rate) => {
        let body = {
            orderUuid,
            market,
            quantity,
            rate,
        }
        
        console.log(body)

        try {
            const res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)
            console.log(res.data)
            if(res.data.success){
                return res.data.result.uuid
            }
        } catch (error) {
            console.log('updateOrder ---', error)
        }
    }

    const getFees = async transactions => {
        console.log('getting fees...')
        let total = 0;

        if(!transactions){
            return;
        }

    
        for(let i = 0; i < transactions.length; i++){
            
            let res = await axios.get(`https://livenet.flocha.in/api/tx/${transactions[i]}`)

            total += res.data.fees
        } 

        return Number(total.toFixed(8))
    }

    const getSalesHistory = async (token, orderId) => {
        try {
            const res = await axios.get(`${API_URL}/bittrex/salesHistory`, config)


            let {salesHistory} = res.data;

            console.log({orderId})

            const orderCompleted = salesHistory.find(el => el.OrderUuid === orderId)

            if(orderCompleted){
                return Number((orderCompleted.Price - orderCompleted.Commission).toFixed(8))
            }

            else null;

        } catch (error) {
            console.log('ERR; getSalesHistory ----', error)
        }
    }

    const getCoinbaseBTCUSD = async () => {
        try {
            const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC')

            return Number(response.data.data.rates.USD)
            
        } catch (error) {
            console.log('Err; getCoinbaseBTCUSD -----', error)
        }
    };

    const getProfitUsd = (BtcFromTrades, PriceBtcUsd, CostOfRentalUsd) => {
         return  ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
    }

    const getRentalBudget3HrCycleUsd = (CostOfRentalUsd, ProfitUsd, ProfiReinvestmentRate) => {
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

            console.log(body)
            let res = await axios.post(`${API_URL}/bittrex/withdraw`, body, config)
        
            return res.data;

        } catch (error) {
            console.log('ERR; withDrawFromBittrex -----', error)
        }
    }



    const {
        address,
        token,
        targetMargin,
        profitReinvestment,
        updateUnsold,
        dailyBudget,
        _id,
    } = profile


    console.log({address})

    if(!address){
        console.log('no address')
        return 'No Address'
    }

    const margin = targetMargin / 100;
    const ProfitReinvestmentRate = profitReinvestment / 100;

    const myWallet = new Wallet(mnemonic);

    let {balance, transactions} = await getBalanceFromAddress(address);

    let floBittrexAddress = await getBittrexAddress(token);

            
            ReceivedQty = balance; 
            FeeFloTx1 = await getFees(transactions)
            TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)

            console.log('pre call -----', {ReceivedQty, FeeFloTx1, TotalQty, floBittrexAddress})

            if(balance == 0){
                return console.log('NO BALANCE', balance)
            }          

            //TXID
            // Send to Bittrex. Get network Fee for moving tokens
            let bittrexTX = await send_a_payment(floBittrexAddress, TotalQty).catch(() => { 
                console.error("Unable to send Transaction!", error) 
            })

            if(!bittrexTX) {
                console.log('failed to send tokens')
                return;
            }

                let isUpdate = false;
                let orderReceiptID = ''


                const checkConfirmations = async () => {
                    try {

                        console.log('checking confirmations')

                        let res = await axios.get(`https://livenet.flocha.in/api/tx/${bittrexTX}`)

                        let {fees, confirmations } = res.data
                        

                        
                        FeeFloTx2 = fees
                        CostOfRentalBTC=0.0003686 //! get this form AutoRent
                        TradeFee= .002 //!
                        EstFeeBtcTx1=0.00001551 //! get from somewhere
            
                        ReceivedQty= balance
                        TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                        SellableQty = getSellableQty(TotalQty, FeeFloTx2)
                        
                        OfferPriceBtc = getOfferPriceBtc(CostOfRentalBTC,TradeFee,margin,EstFeeBtcTx1,TotalQty,FeeFloTx1,FeeFloTx2)
                    
                        console.log(
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
                                OfferPriceBtc
                            
                            }
                            )
    
                        // bittrex need 150 confirmations 
                        if(confirmations > 150){
                            if(isUpdate){

                                console.log(
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
                                        OfferPriceBtc
                                    
                                    })

                                    ReceivedQty = balance; 
                                    TotalQty = getTotalQty(ReceivedQty, FeeFloTx1)
                                    SellableQty  = getSellableQty(TotalQty, FeeFloTx2)
                                    OfferPriceBtc = getOfferPriceBtc(CostOfRentalBTC, TradeFee,margin, EstFeeBtcTx1,TotalQty,FeeFloTx1,FeeFloTx2);
    
                                    console.log('If Update --- before runing function;', {SellableQtyUp, OfferPriceBtcUp})


                                const res = await updateOrder(orderReceiptID,token, SellableQty, OfferPriceBtc)
                                checkOrderStatus()
                                orderReceiptID = res;
                                return BtcFromTrades += (await getSalesHistory(token, orderReceiptID));
                            } else { 
                            confirmed = true;
                            confirmations=0;


                            
                            const res = await createSellOrder(token, SellableQty, OfferPriceBtc)
                            checkOrderStatus()
                            orderReceiptID = res
                            return BtcFromTrades += (await getSalesHistory(token, orderReceiptID));

                        }}
                    }
                    
                    catch (error) {
                        console.log(error)
                    }

                    
                }
    

                console.log({BtcFromTrades})

                    // BtcFromTrades = cumulative total of Bitcoin earned from trades;
                    // PriceBtcUsd = Coinbase's API - current exchange price for BTC in USD;
                    // ProfitUsd = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd

                const shouldIUpdated = async () => {
                    try {
                        console.log('runing updating')
                        const res = await getBalanceFromAddress(address);

                        updatedBalance = res.balance
                        transactions = res.transactions


                        // will need to create a variable for the least amount, I can push up to bittrex wallet.
                        if(updatedBalance > 10){
                            console.log('pre', {balance, updatedBalance})
                            balance += updatedBalance
                            FeeFloTx1 = await getFees(transactions)
                            console.log('pre', {balance, updatedBalance, FeeFloTx1})

                            isUpdate = true;

                            //push new tokens to wallet
                            bittrexTX = await send_a_payment(floBittrexAddress, updatedBalance).catch(() => { 
                                console.error("Unable to send Transaction!", error) 
                            })

                        } else {
                            console.log('Not enought to send to Bittrex', updatedBalance)

                        }
                    } catch (error) {
                        console.log(error)
                    }
                }

            const checkOrderStatus = async () => {
                console.log('Running Check Order Status.....')
                const BtcFromTrades = await getSalesHistory(token, orderReceiptID)

                if(BtcFromTrades){
                    console.log("CLOSED")


                    PriceBtcUsd = await getCoinbaseBTCUSD();
                    CostOfRentalUsd = CostOfRentalBTC * PriceBtcUsd
                    ProfitUsd = getProfitUsd(BtcFromTrades, PriceBtcUsd, CostOfRentalUsd)
                    RentalBudget3HrCycleUsd = getRentalBudget3HrCycleUsd(CostOfRentalUsd, ProfitReinvestmentRate);
                    RentalBudgetDailyUsd = getRentalBudgetDailyUsd(RentalBudget3HrCycleUsd);
                    TakeProfitBtc = getTakeProfitBtc(ProfitUsd, ProfitReinvestmentRate, PriceBtcUsd)

                    console.log(
                        'End Trade Cycle',
                    {
                        BtcFromTrades,
                        PriceBtcUsd,
                        CostOfRentalUsd,
                        ProfitUsd,
                        ProfitReinvestmentRate,
                        RentalBudget3HrCycleUsd,
                        RentalBudgetDailyUsd,
                        TakeProfitBtc
                    
                    }
                    )

                    if(TakeProfitBtc){
                        console.log('Withdraw from bittrex ---')
                        //coinbase btc address;
                        //todo: get user's btc address.
                        let userBTCAddress = '1PSuvt641rsJm4RF4swAxMAa4zhNpzqJLt'

                        // this will havae to be done by the user on Trinity
                        // let sentToCoinbase = await withdrawFromBittrex('BTC', TakeProfitBtc, coinbaseAddress);
                        // console.log('sentToCoinbase ---', sentToCoinbase);
                    
                        // let remainingBtc = Number((BtcFromTrades - TakeProfitBtc).toFixed(8))
                        //hdmw wallet address;

                        let sentToHDMW = await withdrawFromBittrex('BTC', BtcFromTrades, userBTCAddress);
                        console.log('sentToHDMW ---', sentToHDMW)
                        clearAllIntervals(timer, update, orderStatus);
                    } 
                    
                }

            }



            //Todo: fix loop times.
            let timer = setInterval(() => {
                checkConfirmations()
            }, (1 * ONE_MINUTE))

            let update = setInterval(() => {
                shouldIUpdated()
            },(updateUnsold * (3 * ONE_MINUTE)))

            let orderStatus = setInterval(() => {
                checkOrderStatus()
            },(updateUnsold * (5 * ONE_MINUTE)))

            const clearAllIntervals = (timer, update, orderStatus) => {
                    console.log('--- TRADE END ---')
                    this.clearInterval(timer)
                    this.clearInterval(update)
                    this.clearInterval(orderStatus)
            }

}
