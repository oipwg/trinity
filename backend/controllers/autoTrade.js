require('dotenv').config();
const User = require('../models/user')
const ATSupportedEx = require('../autoTrade/supportedExchanges')
const { merge } = require('lodash')

module.exports = {
    on: async(req, rentalAddress, options) => {
        try {

            let { name, duration } = options
            const { profile_id } = req.body
            const accessToken = req.headers['x-auth-token']
            // let _id = profile_id;
            let _id = req.params._id

            const user = await User.findById(req.user.id).select('-password')

            let profile = user.profiles.filter(profile => profile._id == _id)

            ATSupportedEx(...profile, accessToken, user.wallet, 'sajhasdjhad', 'eddie', 4)

            return {success: 'Auto Trading Started.'}
        } catch (error) {
            console.log(error);
        }
    },
        results: async (req,res, next) => {
        try {
            const {timestarted, profile, rental, costOfRentalBtc, priceBtcUsd, duration, btcFromTrades, totalMined, profitReinvestment, completedOrders} = req.body


            

            let obj = {
                     [profile] : [{
                        timestarted,
                        costOfRentalBtc,
                        priceBtcUsd,
                        duration,
                        btcFromTrades,
                        totalMined,
                        profitReinvestment,
                        completedOrders
                     }]
                }
            const user = await User.findById(req.user.id).select('results')

            let foundProfile = user.results.find(obj => Object.keys(obj) == profile)
            let index = user.results.findIndex(obj => Object.keys(obj) == profile)

            if(foundProfile) {
                let obj = {
                        timestarted,
                        costOfRentalBtc,
                        priceBtcUsd,
                        duration,
                        btcFromTrades,
                        totalMined,
                        profitReinvestment,
                        completedOrders
                }

                user.results[index][profile].push({...obj})
            } else {
                user.results.push(obj)
            }

            await user.save()                                            


            res.status(200).json({
                success: 'RESULTS POSTED!', user
            });    
        
        } catch (error) {
            console.log({error})
        }
    }

}