require('dotenv').config();
const User = require('../models/user')
// const Profile = require('../models/profiles')


module.exports = {
    new: async(req,res) => {
        try {
            const { profileName, token } = req.body;
            const user = await User.findById(req.user.id).select('profiles')

            user.profiles = [...user.profiles, {profileName, token}]

            await user.save()
            res.status(200).json({success: 'New profile created', profiles: user.profiles})

        } catch (error) {
            console.log(error)
        }
    }

};
