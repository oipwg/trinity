require('dotenv').config();


const JWT = require('jsonwebtoken');
const {
    JWT_SECRET,
    COINBASE_CLIENT_ID,
    COINBASE_CLIENT_SECRET,
    COINBASE_REDIRECT_URL,
    COINBASE_SECURE_RANDOM,
} = process.env;
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
            const { userName, email, password, mnemonic, wallet } = req.body;


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
                wallet
            });


            // use this to grab addresses

            // let accountMaster = bip32.fromBase58(xPrv, Networks.flo.network)
            
            // let account = new Account(accountMaster, Networks.flo, false);

            // const EXTERNAL_CHAIN = 0
            // for (let i = 0; i < 25; i++) {
            //   console.log(`${i}: ${account.getAddress(EXTERNAL_CHAIN, i).getPublicAddress()}`)
            // }

            const user = await newUser.save()
            
            const sendUser = await User.findOne({ userName: user.userName}).select('-password');

            res.status(200).json({
                token: signToken(newUser),
                user: sendUser
            });
        } catch (error) {
            console.log(error);
        }
    },

    signIn: async (req, res, next) => {
        try {
            const { userName } = req.body;

            const user = await User.findOne({ userName }).select('-password');

            if (!user) {
                return res.status(403).json({ error: 'User does not exist' });
            }

            res.status(200).json({
                token: signToken(user),
                user
            });

        } catch (error) {
            console.log(error);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const { oldPassword, password, mnemonic } = req.body;

            const user = await User.findById(req.user.id)

            const isMatch = await user.isValidPassword(oldPassword);

            if (!isMatch)
                return res.status(400).json({ error: 'Incorrect password' });

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

    // example, pulls ID from token = req.user.id
    user: async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).select('-password');

            res.json(user);
        } catch (error) {
            console.log(error);
        }
    },

    validatePassword: async (req, res, next) => {
        try {
            const { password } = req.body;

            console.log(req.body)

            const user = await User.findById(req.user.id)
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isMatch = await user.isValidPassword(password);

            console.log('ismatch', isMatch);

            if (!isMatch)
                return res.status(401).send({ error: 'Incorrect password' });

            res.status(201).json({ validate: true });
        } catch (error) {
            console.log('error', error);
        }
    },
};
