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
     ProfitUsd // = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd

let orderReceipt;




module.exports = async function(profile, mnemonic, accessToken) {

    if(!accessToken){
        console.log('no access token');
        return 'ERROR; No Access Token'
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

    const getOfferPriceBtx = (CostOfRentalBTC, TradeFee, margin, EstFeeBtcTx1, TotalQty, FeeFloTx1, FeeFloTx2) => {
        return ( CostOfRentalBTC * ( TradeFee + 1 ) * ( margin + 1 ) + EstFeeBtcTx1 ) / ( TotalQty - FeeFloTx1 - FeeFloTx2 );
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

    if(!profile){
        console.log('no profile');
        return 'ERROR; Profile Not Found'
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


    const margin = targetMargin / 100;

    const myWallet = new Wallet(mnemonic);

    let {balance, transactions} = await getBalanceFromAddress(address);
    
    console.log('balance first -----', balance)

            // try {
                //todo:
                // async function getTotalFees() {
                    

                //     for(let i = 0; i < transactions.length; i++){
                        
                //         // let res = await axios.get(`https://livenet.flocha.in/api/tx/${transactions[i]}`)
                    
                //         console.log(res.data.fees)
                //     }
                    
                // }
            // } catch (error) {
            //     console.log(error)
            // }

            // ! Grab this from loop - //TODO: ^
            FeeFloTx1 = 0.000226;
            
            ReceivedQty = balance; 

            TotalQty = getTotalQty(ReceivedQty + FeeFloTx1);

            let floBittrexAddress = await getBittrexAddress(token);



            //TXID
            // Sent to Bittrex. Get network Fee for moving tokens
            console.log('pre call -----', {ReceivedQty, FeeFloTx1, TotalQty, floBittrexAddress})
            let bittrexTX = await send_a_payment(floBittrexAddress, TotalQty).catch(() => { 
                console.error("Unable to send Transaction!", error) 
            })

            if(!bittrexTX) {
                console.log('failed to send tokens')
                return;
            }

            const createSellOrder = async (market, quantity, rate) => {
                
                let body = {
                    market,
                    quantity,
                    rate: rate.toFixed(8)
                }
                
                console.log('running createSellOrder -------', body)

                try {
                    const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)
                    console.log(res.data)
                    return res.data.result.uuid
                } catch (error) {
                    console.log('error ---', error)
                }
                
            }

            try {

                let confirmed = false;
                let isUpdate = false;
                let orderReceiptID = ''





                const checkConfirmations = async () => {
                    try {
                        // let res = await axios.get(`${API_URL}/bittrex/deposit-history`, config)
                        console.log('checking confirmations')
                        let res = await axios.get(`https://livenet.flocha.in/api/tx/${bittrexTX}`)

                        let {fees, confirmations } = res.data
                        console.log('fees', fees)
                        console.log('conformiations', confirmations)

                        FeeFloTx2 = fees

                        CostOfRentalBTC=0.0003686 //! get this form AutoRent
                        TradeFee= .002 //!
                        EstFeeBtcTx1=0.00001551 //! get from somewhere
                        // TotalQty=56.40661617
                        // FeeFloTx2=0.000522 //! here cause of rate limited
            
                        OfferPriceBtc = ( CostOfRentalBTC * ( TradeFee + 1 ) * ( margin + 1 ) + EstFeeBtcTx1 ) / ( TotalQty - FeeFloTx1 - FeeFloTx2 )
                    
                        SellableQty = TotalQty - FeeFloTx2


            
                        console.log(
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
                            
                            }
                            )
    

                        if(confirmations > 150){
                            if(isUpdate){
                                //search open order that matches orderReciptID
                                // update it;

                                SellableQty  = getSellableQty(TotalQty, FeeFloTx2)
                                OfferPriceBtc = getOfferPriceBtx(CostOfRentalBTC, TradeFee,margin, EstFeeBtcTx1,TotalQty,FeeFloTx1,FeeFloTx2);

                                
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

                                SellableQty += SellableQtyUp;
                                // OfferPriceBtc += OfferPriceBtcUp;

                                console.log({SellableQtyUp, OfferPriceBtcUp})


                                orderReceiptID = await updateOrder(orderReceipt,token, SellableQty, OfferPriceBtc)
                                return orderReceiptID;
                            } else { 
                            confirmed = true;

                            orderReceiptID = await createSellOrder(token, SellableQty, OfferPriceBtc)
                            // return clearInterval(timer);
                        }}
                    } catch (error) {
                        console.log(error)
                    }

                    
                }


                const timer = setInterval(() => {
                    checkConfirmations()
                }, (2 * min))




                //if more FLO/RVN show up in the wallet addres. Send them to Bittrex, update FeeFloTX1, TotalQTR, SellableQTY //TODO:

                //for testing should grab it from the first order created?
                console.log('orderReceiptID', orderReceiptID)

                    // BtcFromTrades = cumulative total of Bitcoin earned from trades;
                    // PriceBtcUsd = Coinbase's API - current exchange price for BTC in USD;
                    // ProfitUsd = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
                    const getCoinbaseBTCUSD = () => {
                        const coinbase = axios.create({
                            baseURL: 'https://api.coinbase.com/v2',
                            timeout: 1000,
                        });

                    return coinbase
                            .get('/exchange-rates?currency=BTC')
                            .then(res => {
                                console.log('BTC -> USD', res.data.rates.USD)
                                return res.data.rates.USD
                            })
                            .catch(err => {
                                console.log(err.response);
                            });
                    };

                PriceBtcUsd = await getCoinbaseBTCUSD();
                console.log({PriceBtcUsd})

                let hasUpdated = false;

                const updateOrder = async (orderUuid, market, quantity, rate) => {
                    let body = {
                        orderUuid,
                        market,
                        quantity,
                        rate: rate.toFixed(8)
                    }
                    
                    console.log(body)

                    try {
                        const res = await axios.post(`${API_URL}/bittrex/updateOrder`, body, config)
                        console.log(res.data)
                        return res.data.result.uuid
                    } catch (error) {
                        console.log('updateOrder ---', error)
                    }
                }
                

                const shouldIUpdated = async () => {
                    try {
                        console.log('runing updating')
                        const res = await getBalanceFromAddress(address);

                        newToken = res.balance
                        transactions = res.transactions

                        // will need to create a variable for the least amount, I can push up to bittrex wallet.
                        if(updatedBalance > 10){
                            console.log(updatedBalance)
                            balance += updatedBalance


                            isUpdate = true;
                            //push to wallet
                            bittrexTX = await send_a_payment(floBittrexAddress, newToken).catch(() => { 
                                console.error("Unable to send Transaction!", error) 
                            })

                        } else {
                            console.log('Not enought to send to Bittrex', updatedBalance)

                        }
                    } catch (error) {
                        console.log(error)
                    }

                    
                }

                const update = setInterval(() => {
                    shouldIUpdated()
                },(updateUnsold * (3 * min)))

            } catch (error) {
                console.log(error)
            }
}
