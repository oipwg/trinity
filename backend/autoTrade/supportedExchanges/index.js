//todo: grab - shoot down user's menemonic to access said wallet.
// ? Ask user to enter password; if wallet is unlocked?
require('dotenv').config();
const { API_URL}  = process.env
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet
const axios = require('axios')


let TotalQty; //Receviced + FeeFloTx1
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

module.exports = async function(profile, mnemonic) {

    //! fix this later; pass down access token. Refactor later
    accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJUcmluaXR5IiwiaWQiOiI1ZTkxMDM2OTUxZDVlMTI3ZTFlZmJkM2UiLCJpYXQiOjE1ODcwNzAxMTU0NjAsImV4cCI6MTU4NzE1NjUxNTQ2MH0.XDlyIq2F0QP2nB7m6wU_yXlnwZy3mGcjs_XHxfigpkE'

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': accessToken
        },
    };


    if(!profile){
        console.log('no profile');
        return 'ERROR; Profile not found'
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

    let margin = targetMargin / 100;


    let myWallet = new Wallet(mnemonic, {
        supported_coins: ['flo'],
    });

    let walletValidation = myWallet.fromMnemonic(mnemonic);

    // if(!walletValidation){
    //     console.log( 'Mnemonic Invalid')
    //     return 'Mnemnoic Invalid'
    // }


            const getBalanceFromAddress = async (address) => {
                try {
                    console.log('addy', address)
                    let res = await axios.get(`https://livenet.flocha.in/api/addr/${address}`)

                    return res.data    
                } catch (error) {
                    console.log('error -------', error)
                }
            }

            let {balance, transactions} = await getBalanceFromAddress(address);

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
            FeeFloTx1 = 0.0000454 // 0.0000454

            ReceivedQty = balance; 

            TotalQty = ReceivedQty + FeeFloTx1;
            

            const getBittrexAddress = async () => {
                try {
                    
                    let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

                    return res.data.bittrexAddresses.FLO.Address

                } catch (error) {
                    console.log('getBittrexAddress Failed ------- ', error)
                }
            }

            let floBittrexAddress = getBittrexAddress();

            const sendToBittrex = async (wallet) => {
                try {
                    
                    wallet
                    .sendPayment({to: {[floBittrexAddress]: [TotalQty]}})
                    .then(txid => {
                        console.log("Successfully sent Transaction! " + txid)
                        return txid;
                    }
                    )
                    .catch(error => console.log("Unable to send Transaction!", error))

                } catch (error) {
                    console.log('sendToBittrex Failed ------- ', error)
                }
            }

            // Sent to Bittrex. Get network Fee for moving tokens
            let bittrexTX = sendToBittrex();

            if(bittrexTX){
                try {
                    let res = await axios.get(`https://livenet.flocha.in/api/tx/${bittrexTX}`)

                    FeeFloTx2 = res.data.fees

                } catch (error) {
                    console.log(error)
                }
            }

            try {

                let confirmed = false;

                const checkConfirmations = async () => {


                    try {
                        let res = await axios.get(`${API_URL}/bittrex/deposit-history`, config)

                        let confirmedList = res.data.result
    
                        let hasConfirmed = confirmedList.filter(a => a.TxId == bittrexTX)
    
                        if(hasConfirmed){
                            confirmed = true
                            return clearInterval(timer);
                        }
                    } catch (error) {
                        console.log(error)
                    }

                    
                }


                const timer = setInterval(() => {
                    checkConfirmations()
                }, 30000)

                CostOfRentalBTC=0.0003686 //! get this form AutoRent
                TradeFee=1 //!
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
                        FeeFloTx2
                    
                    
                    }
                    )

                console.log('margin', margin)
                console.log('offerPrice' , OfferPriceBtc.toFixed(8))
    
                //if more FLO/RVN show up in the wallet addres. Send them to Bittrex, update FeeFloTX1, TotalQTR, SellableQTY //TODO:
                

                const createSellOrder = async (market, quantity, rate) => {
                    let body = {
                        market,
                        quantity,
                        rate: rate.toFixed(8)
                    }
                    
                    try {
                        const res = await axios.post(`${API_URL}/bittrex/createSellOrder`, body, config)

                        console.log(res.data)

                    } catch (error) {
                        console.log('error ---', error)
                    }
                    
                }
            
            let orderReceipt;

            

            if(confirmed && SellableQty){
                orderReceipt = createSellOrder(token, SellableQty, OfferPriceBtc)
            }

                console.log('orderReceipt', orderReceipt)

                    // BtcFromTrades = cumulative total of Bitcoin earned from trades;
                    // PriceBtcUsd = Coinbase's API - current exchange price for BTC in USD;
                    // ProfitUsd = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd
                    const getCoinbaseBTCUSD = () => {
                        const coinbase = axios.create({
                            baseURL: 'https://api.coinbase.com/v2',
                            timeout: 1000,
                        });

                        coinbase
                            .get('/exchange-rates?currency=BTC')
                            .then(res => {
                                console.log('BTC -> USD', res.data.rates.USD)
                                return res.data.rates.USD
                            })
                            .catch(err => {
                                console.log(err.response);
                            });
                    };

                PriceBtcUsd = getCoinbaseBTCUSD()








                
                
            } catch (error) {
                console.log(error)
            }
}
