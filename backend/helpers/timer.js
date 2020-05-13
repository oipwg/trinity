const { on } = require('../controllers/autoTrade');
const User = require('../models/user');
const spartanbot = require('spartanbot')


class Timer {
    constructor(settings, req) {
        this.profiles = settings.profiles
        this.duration = settings.duration
        this.profileId = settings.profile_id
        this.provider = settings.badge[0].provider
        this.req = req
        this.ids = settings.rentalId

    }

    getProfileAddress() {
        for(let profile of this.profiles) {
            if (profile._id.toString() === this.profileId) {
                return profile.address.publicAddress
            }
        }
    }

    async getProviderAddress() {
        let account = ( await this.provider.getAccount()).data.deposit.BTC.address
        return account
    }

    async getCostOfRental(transactions) {
        let ids_length = this.ids.length;
        let transaction_length = transactions.length;
        let amount = 0;

        for (let i = 0; i < ids_length; i++) {
            let id = this.ids[i];

            for (let j = 0; j < transaction_length; j++) {
                if (id === transactions[j].rental) {
                    amount += Number(transactions[j].amount);
                }
            }
        }
        let address = await this.getProviderAddress()
        on(this.req, address)
        return amount
    }
    async getTransactions() {
        try {
            let params = {
                start: 0,
                limit: 100
            };
            let res = await this.provider.getTransactions(params)
            let transactions = res.data.transactions;
            this.getCostOfRental(transactions)
        } catch(e) {
            console.log('Error during getTransactions timer.js: ',e)
        }
    }

    
    setTimer() {
        setTimeout(() => {
            this.getTransactions()
        }, this.duration * 60 * 1000)
    }
}

module.exports = Timer
