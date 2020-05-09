const { on } = require('../controllers/autoTrade');
const User = require('../models/user');
const spartanbot = require('spartanbot')


class Timer {
    constructor(settings, req) {
        console.log('settings:', settings.badge[0].provider)
        this.profiles = settings.profiles
        this.duration = settings.duration
        this.profile = settings.profile_id
        this.provider = settings.badge[0].provider
        this.req = req
        this.ids = settings.rigIds
    }
    async sendCostOfRental() {
        let autoTrade = await on(this.req);
    }

    getCostOfRental(transactions) {
        let ids_length = this.ids.length;
        let transaction_length = transactions.length;
        let amount = 0;

        for (let i = 0; i < ids_length; i++) {
            let id = this.ids[i];

            for (let j = 0; j < transaction_length; j++) {
                if (id === transactions[j].rig) {
                    amount += Number(transactions[j].amount);
                }
            }
        }
        return amount
    }
    async getTransactions() {
        try {
            let params = {
                start: 0,
                limit: this.ids.length
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
            console.log('this.profile', this.profile)
            this.getTransactions()
        }, this.duration * 27000)
    }
}

module.exports = Timer
