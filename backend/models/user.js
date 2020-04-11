const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true,
        default: null,
    },
    token: {
        type: String,
        require: true,
        default: null,
    },
    autoRent: {
        on: {
            type: Boolean,
            default: null,
        },
        mode: {
            spot: {
                type: Boolean,
                default: null,
            },
            alwaysMineXPercent: {
                type: Boolean,
                default: null,
            },
        }
    },
    autoTrade: {
        on: {
            type: Boolean,
            default: null,
        },
        mode: {
            morphie:  {
                type: Boolean,
                default: null,
            },
            supportedExchanges:  {
                type: Boolean,
                default: null,
            },
        }
    },
    targetMargin:  {
        type: Number,
        default: null,
    },
    profitReinvestment:  {
        type: Number,
        default: null,
    },
    updateUnsold:  {
        type: String,
        default: null,
    },
    dailyBudget:  {
        type: Number,
        default: null,
    },
    notes: {
        type: String,
        default: ''
    }
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
