require('dotenv').config();
const User = require('../models/user')
const _ = require('lodash')



module.exports = {
    new: async( req, res ) => {
        try {
            const { name, token } = req.body;
            const user = await User.findById(req.user.id).select('profiles')

            const foundDupe = user.profiles.find(profile => profile.name == name)

            if(foundDupe) return res.status(400).json({error: 'Profile already exist'})

            user.profiles = [...user.profiles, {name, token}]
 
            await user.save()
            res.status(200).json({success: 'New profile created', profiles: user.profiles})

        } catch (error) {
            console.log(error)
        }
    },

    get: async( req, res ) => {
        try {
            const user = await User.findById(req.user.id).select('profiles')

            const {profiles} = user

            res.status(200).json({profiles: profiles})

        } catch (error) {
            console.log(error)
        }
    },

    update: async( req, res ) => {
        try {

            const {_id} = req.body
            
            const user = await User.findById(req.user.id).select('profiles')

            let profileIndex = user.profiles.findIndex(profile => profile._id == _id)

            let profile = user.profiles[profileIndex]

            let updated = _.omit(req.body, ['address'])

            user.profiles[profileIndex] = {profile, ...updated}
            // await user.save()
            res.status(200).json({success: 'Updated profiles', profiles: user.profiles})
        } catch (error) {
            console.log(error)
        }
    },

    delete: async (req, res ) => {
        try {
            const user = await User.findById(req.user.id).select('profiles')

            let { _id } = req.params

            console.log(_id)


         let filteredProfiles = user.profiles.filter(profile => profile._id != _id)

            user.profiles = filteredProfiles

            await user.save();
                res.status(200).json({success: 'Profile deleted', profiles: user.profiles})
        } catch (error) {
            console.log(error)
        }
    }

};
