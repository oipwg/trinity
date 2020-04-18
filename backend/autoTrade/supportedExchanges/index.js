/*

PART 1.

Bot selects the earliest Automatic Rental which still has unsold tokens, finds its wallet address in the application DB	

Alternatively, if no Automatic Rentals have been completed, Bot should wait until 15 Minutes after the first one is expected to complete, finds its wallet address in the application DB	

Bot discovers how many tokens are in the wallet address, and by dividing the rental cost by the number of tokens, it derives a CostPerToken	

Bot checks the transactions that deposited the tokens into the wallet address for their cumlative transaction fees...	and stores this value as the static variable FeeFloTx1 for this Automatic Rental

Bot discoveres how many tokens are in the wallet address...	and stores this value as the static variable ReceivedQty for this Automatic Rental
"and derives the TotalQty it mined using this formula: 

TotalQty = ReceivedQty + FeeFloTx1"	

Bot moves tokens to highest volume exchange for the given blockchain and takes note of the transaction fee required...	and stores this vaue as the static variable FeeFloTx2 for this Automatic Rental
"and derives the SellableQty it will use to figure out offer prices using this formula:
 SellableQty = TotalQty - FeeFloTx2"	

 Bot waits for 150 blocks to be mined on the Flo blockchain, or _______ blocks to be confirmed on the RVN blocckhain	


"Margin requested by user profile, as a decimal (ie, 10% should be treated as 0.10)

TradeFee either the TradeFeeMaker or the TradeFeeTaker, depending on the type of trade (for now, all of our trades will be Maker)

EstFeeBtcTx1 this is the transaction fee to move BTC from Bittrex to Coinbase, delineated in BTC, not sure how best to look this up, lets discuss (https://bitcoinfees.net)"

*/


//todo: grab - shoot down user's menemonic to access said wallet.
// ? Ask user to enter password; if wallet is unlocked?
require('dotenv').config();
const { API_URL}  = process.env
const HDMW = require('@oipwg/hdmw')
const Wallet = HDMW.Wallet
const axios = require('axios')


let TotalQty
let ReceivedQty;
// These values come from what resulted in the rentals;

let SellableQty;
let FeeFloTx2;

let  OfferPriceBtc,
     CostOfRentalBTC,
     TradeFee,
     EstFeeBtcTx1,
     ProfitUsd

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

    let FeeFloTx1 = 0;


    let myWallet = new Wallet(mnemonic, {
        supported_coins: ['flo'],
    });

    let walletValidation = myWallet.fromMnemonic(mnemonic);

    if(!walletValidation){
        console.log( 'Mnemonic Invalid')
        return 'Mnemnoic Invalid'
    }

        

            const getBalanceFromAddress = async (address) => {
                try {
                    let res = await axios.get(`https://livenet.flocha.in/api/addr/${address}`)

                    return res.data    
                } catch (error) {
                    console.log('error -------', error)
                }
            }

            let poop = await getBalanceFromAddress;
            console.log(poop)

            try {
                // let res = await axios.get(`https://livenet.flocha.in/api/addr/${address}`)

                // let { balance, transactions } = res.data
            


                //todo:
                // async function getTotalFees() {
                    

                //     for(let i = 0; i < transactions.length; i++){
                        
                //         // let res = await axios.get(`https://livenet.flocha.in/api/tx/${transactions[i]}`)
                    
                //         console.log(res.data.fees)
                //     }
                    
                // }

            //! 
            FeeFloTx1 = 0.04455796

            ReceivedQty = balance; 

            } catch (error) {
                console.log(error)
            }

            TotalQty = ReceivedQty + FeeFloTx1;
            


            //Get Bittrex Flo Addy.
            //Send token to Bittrex.
            try {
                let res = await axios.get(`${API_URL}/bittrex/deposit-addresses`, config)

                let floBittrexAddress = res.data.bittrexAddresses.FLO.Address

                let bittrexTX;


                // myWallet
                //     .sendPayment({to: {[floBittrexAddress]: [TotalQty]}})
                //     .then(txid => {
                //         console.log("Successfully sent Transaction! " + txid)
                //         return bittrexTX = txid;
                //     }
                //     )
                //     .catch(error => console.log("Unable to send Transaction!", error))
                
                // console.log('-----------', bittrexTX)
                //! testing grab from sucesss
                bittrexTX = 'e2e23f2ac5353118c61064fb946ef079bf4269d21ad0ba36ced4f810df9f8411'


                if(bittrexTX){
                    try {
                        let res = await axios.get(`https://livenet.flocha.in/api/tx/${bittrexTX}`)

                        FeeFloTx2 = res.data.fees

                    } catch (error) {
                        console.log(error)
                    }
                }

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
                TotalQty=56.40661617
                FeeFloTx2=0.000522 //! here cause of rate limited
                let margin = targetMargin / 100;

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
                                    
                    // ProfitUsd = ( BtcFromTrades * PriceBtcUsd ) - CostOfRentalUsd

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
            
            // if(balance){
            //     createSellOrder(token, SellableQty, OfferPriceBtc)
            // }








                
                
            } catch (error) {
                console.log(error)
            }
}
