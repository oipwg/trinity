require('dotenv').config();
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStartegy = require('passport-local').Strategy;

const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = process.env;
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
