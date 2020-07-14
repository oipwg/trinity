require('dotenv').config();
const User = require('../models/user')
const ATSupportedEx = require('../autoTrade/supportedExchanges')

module.exports = {
    on: async(req, rentalAddress, options) => {
        try {

            let { name, duration } = options
            const { profile_id } = req.body
            const accessToken = req.headers['x-auth-token']
            let _id = profile_id;

            const user = await User.findById(req.user.id).select('-password')

            let profile = user.profiles.filter(profile => profile._id == _id)

            ATSupportedEx(...profile, accessToken, user.wallet, rentalAddress, name, duration)
            return {success: 'Auto Trading Started.'}
        } catch (error) {
            console.log(error);
        }
    },
        results: async (req,res, next) => {
        try {
            const {timestarted, uuid, profile, rental, 
                costOfRentalBtc, 
                priceBtcUsd, 
                duration, 
                btcFromTrades, 
                totalMined, 
                profitReinvestment, 
                completedOrders,
                bittrexTxid,
                currentOrder,
                currentTxid
            
            } = req.body

            let obj = {
                    uuid,
                    profile,
                    timestarted,
                    costOfRentalBtc,
                    priceBtcUsd,
                    duration,
                    btcFromTrades,
                    totalMined,
                    profitReinvestment,
                    completedOrders,
                    bittrexTxid,
                    currentOrder,
                    currentTxid
            }
            let user = await User.findByIdAndUpdate(req.user.id).select('results')

            user.results.push(obj)


            await user.save(function(err){
                if(err){
                     console.log(err);
                     return;
                }
          
                res.json({user: user });
          }); 
        
        } catch (error) {
            console.log({error})
        }
    }

}