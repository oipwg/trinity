const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

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
        type: Object,
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
    }]
});

userSchema.pre('save', async function(next) {
    try {
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
