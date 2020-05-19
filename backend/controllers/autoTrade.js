require('dotenv').config();
const User = require('../models/user')
const ATSupportedEx = require('../autoTrade/supportedExchanges')

module.exports = {
    on: async(req, res, rentalAddress) => {
        try {


            // const { profile_id } = req.body 
            const accessToken = req.headers['x-auth-token']
            // let _id = profile_id 
            
            let _id = req.params._id

            const user = await User.findById(req.user.id).select('-password')


            let profile = user.profiles.filter(profile => profile._id == _id)


            ATSupportedEx(...profile, accessToken, user.wallet, '3BcRcprhA5xDhZo5Hv81zVK5pSi1gUUrzF')

            return res.send({success: 'Auto Trading Started.'})
        } catch (error) {
            console.log(error);
        }
    }

}