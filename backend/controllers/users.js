require('dotenv').config();
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const User = require('../models/user');

signToken = user => {
    return JWT.sign(
        {
            iss: 'Trinity',
            sub: user._id,
            iat: new Date().getTime(), // curent time
            exp: new Date().setDate(new Date().getDate() + 1), //current time + 1 day ahead
        },
        JWT_SECRET
    );
};

module.exports = {
    signUp: async (req, res, next) => {
        try {
            const { userName, email, password, mnemonic } = req.body;
            // check for user in DB
            const foundUser = await User.findOne({ userName });
            if (foundUser) {
                return res
                    .status(403)
                    .json({ error: 'Username is already in use' });
            }
            const newUser = new User({
                userName,
                email,
                password,
                mnemonic,
            });

            await newUser.save();

            const token = signToken(newUser);
            console.log('user created', { token });
            res.status(200).json({ token });
        } catch (error) {
            console.log(error);
        }
    },

    signIn: async (req, res, next) => {
        try {
            user = req.body;

            console.log(user);
            const token = signToken(user);
            console.log(token);

            res.status(200).json({ token });
            console.log('successful login!');
        } catch (error) {
            console.log(error);
        }
    },
};
