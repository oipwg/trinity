require('dotenv').config();
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const User = require('../models/user');

signToken = user => {
    return JWT.sign(
        {
            iss: 'Trinity',
            id: user._id,
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

            const user = await newUser.save();
            res.status(200).json({
                token: signToken(newUser),
                user: {
                    id: user.id,
                    username: user.userName,
                    email: user.email,
                    mnemonic: user.mnemonic,
                },
            });
        } catch (error) {
            console.log(error);
        }
    },

    signIn: async (req, res, next) => {
        try {
            const { userName } = req.body;

            const user = await User.findOne({ userName });

            if (!user) {
                return res.status(403).json({ error: 'User does not exist' });
            }

            res.status(200).json({
                token: signToken(user),
                user: {
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                    mnemonic: user.mnemonic,
                },
            });

            console.log('successful login!');
        } catch (error) {
            console.log(error);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const { id, oldPassword, password, mnemonic } = req.body;

            const user = await User.findById({ _id: id });

            const isMatch = await user.isValidPassword(oldPassword);

            if (!isMatch)
                return res.status(400).json({ error: 'Incorrenct password' });

            user.password = password;
            user.mnemonic = mnemonic;

            await user.save();
            res.status(200).json({
                success: 'Password Changed!',
            });
        } catch (error) {
            console.log(error);
        }
    },

    secret: async (req, res, next) => {
        try {
            console.log('hey');
        } catch (error) {
            console.log(error);
        }
    },

    user: async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).select('-password');

            res.json(user);
        } catch (error) {}
    },
};
