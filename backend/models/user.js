const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    name: {
        type: String,
        default: '',
    },
    token: {
        type: String,
        default: '',
    },
    address: {
        publicAddress: {type: String, default: ''},
        btcAddress: {type: String, default: ''}
    },
    autoRent: {
        on: {
            type: Boolean,
            default: false,
        },
        mode: {
            spot: {
                type: Boolean,
                default: false,
            },
            alwaysMineXPercent: {
                on: {type: Boolean,
                default: false},
                Xpercent: {type: Number, default: 0}
            },
        }
    },
    autoTrade: {
        on: {
            type: Boolean,
            default: false,
        },
        mode: {
            morphie:  {
                type: Boolean,
                default: false,
            },
            supportedExchanges:  {
                type: Boolean,
                default: false,
            },
        }
    },
    targetMargin:  {
        type: Number,
        default: 0,
    },
    profitReinvestment:  {
        type: Number,
        default: 0,
    },
    updateUnsold:  {
        type: String,
        default: '',
    },
    dailyBudget:  {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: ''
    },
    usedAddresses: [{
        type: String
    }]
});


const userSchema = new Schema({
    userName: {
        type: String,
        require: true,
        unique: true,
    },
    email: {
        type: String,
        lowercase: true,
        unique: false,
    },
    password: { type: String, required: true },
    mnemonic: {
        type: String,
        required: true,
    },
    wallet: {
        btc: {
            xPrv: { type: String, default: ''}
        },
        flo: {
            xPrv: { type: String, default: ''}
        },
        rvn: {
            xPrv: { type: String, default: ''}
        },
    },
    coinbase: {
        accessToken: {type: String},
        refreshToken: {type: String}
    },
    bittrex: {
        apiKey: {type: String},
        secret: {type: String}
    },
    api_key: {
        type: String
    },
    api_secret: {
        type: String
    },
    providerData: [{
        rental_provider: String,
        api_key: String,
        api_secret: String,
        api_id: String
    }],
    indexes : [],
    profiles: [profileSchema]
});

userSchema.pre('save', async function(next) {
    try {
        const user = this;

        if (!user.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(this.password, salt);

        this.password = passwordHash;
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isValidPassword = async function(newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('user', userSchema);

module.exports = User;
