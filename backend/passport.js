require('dotenv').config();
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStartegy = require('passport-local').Strategy;
const CoinbaseStrategy = require('passport-coinbase-oauth2').Strategy;

const { ExtractJwt } = require('passport-jwt');
const {
    JWT_SECRET,
    COINBASE_CLIENT_ID,
    COINBASE_CLIENT_SECRET,
    COINBASE_REDIRECT_URL,
} = process.env;
const User = require('./models/user');



// JSON WEB TOKENS STRATEGY
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: JWT_SECRET,
        },

        async (payload, done) => {
            try {
                const user = await User.findById(payload.sub);

                if (!user) {
                    return done(null, user);
                }

                done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

// LOCAL STRATEGY
passport.use(
    new LocalStartegy(
        {
            usernameField: 'userName',
        },
        async (userName, password, done) => {
            try {
                const user = await User.findOne({ userName });

                //need to handler error

                if (!user) {
                    return done(null, false, { message: 'Incorrect Username' });
                }

                const isMatch = await user.isValidPassword(password);

                if (!isMatch) {
                    return done(null, false, {
                        message: 'Invalid Credentials',
                    });
                }

                done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

/*
coinbase scopes

wallet:contacts:read
wallet:accounts:read
wallet:payment-methods:read
wallet:payment-methods:delete
wallet:payment-methods:limits
wallet:transactions:request
wallet:sells:read
wallet:trades:read
wallet:addresses:read
wallet:addresses:create
wallet:orders:read
wallet:checkouts:read
wallet:deposits:read
wallet:withdrawals:read
wallet:notifications:read
wallet:supported-assets:read
wallet:accounts:update
wallet:accounts:create
wallet:accounts:delete
wallet:trades:create
wallet:orders:create
wallet:deposits:create
wallet:user:update
wallet:checkouts:create
wallet:orders:refund
wallet:transactions:transfer
external:wallet-addresses:write

*/



const myStrategy = new CoinbaseStrategy({
    clientID: COINBASE_CLIENT_ID,
    clientSecret: COINBASE_CLIENT_SECRET,
    callbackURL: COINBASE_REDIRECT_URL,
    authorizationURL: 'https://coinbase.com/oauth/authorize',
    tokenURL: 'https://api.coinbase.com/oauth/token',
    userProfileURL: 'https://api.coinbase.com/v2/user',
    scope: ['wallet:user:email'],
    passReqToCallback: true,

},

  async (req, accessToken, refreshToken, profile, done) => {
    // asynchronous verification, for effect...
    process.nextTick(async function () {
        try {
                console.log({
                    accessToken,
                    refreshToken,
                    profile,
                    cb,
                });


                const user = await User.findById(req.user.id).select('-password');

                if(!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                profile = user;


                user.coinbase = {
                    accessToken,
                    refreshToken,
                };

                await user.save({validateBeforeSave: false})


                return done(null, profile);
            } catch (error) {
                console.log(error);
                cb(error, false);
            }
    });
  }
);


myStrategy.authorizationParams = function(options) {
    return {
        'meta[send_limit_amount]': 1,
        'meta[send_limit_currency]': 'USD',
        'meta[send_limit_period]': 'day'
    };
  };

passport.use('coinbase', myStrategy)