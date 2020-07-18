const { on } = require('../controllers/autoTrade');
const User = require('../models/user');
const { API_URL } = require('../../config.js');
const axios = require('axios')
const { getCircularReplacer } = require('../spartanBot/utils');
const { Rent } = require('./rentValues')

/**
 * Class to start a timer to gather data at end of rental
 */
class Timer {
    /**
     * 
     * @param {Object} settings Information to be used for timer
     * @param {Object} req Request object to be passed off later
     */
    constructor(settings, req, res) {
        console.log('settings: badge', settings.badge)
        this.name = settings.name
        this.profiles = settings.profiles
        this.duration = Number(settings.badge[0].duration)
        this.profileId = settings.profile_id
        this.provider = settings.badge[0].provider
        this.req = req
        this.res = res
        this.ids = settings.rentalId
        this.emitter = settings.emitter
        this.userId = settings.userId
        this.userOptions = settings.userOptions
    }
    
    /**
     * @property {Function} getProfileAddress Get current profile address being used
     * @returns {String} publicAddress 
     */
    getProfileAddress() {
        for(let profile of this.profiles) {
            if (profile._id.toString() === this.profileId) {
                return profile.address.publicAddress
            }
        }
    }

    timestamp() {
        let name = this.name+':';
        let date = new Date()
        return name + ' '+ date.getFullYear() + "-" +
            (date.getMonth() + 1) + "-" +
            date.getDate() + " " +
            date.getHours() + ":" +
            date.getMinutes() + ":" +
            date.getSeconds()
    }

    async getProviderAddress() {
        console.log(this.timestamp() ,'this.provider timer.js', this.provider.constructor.name)
        if(this.provider.constructor.name === 'NiceHashProvider') {

            let address = ( await this.provider.getDepositAddresses('BTC') ).list[0].address
            console.log('address: BTC', address)
            return address

        } else if (this.provider.constructor.name === 'MRRProvider') {
            let address = ( await this.provider.getAccount() ).data.deposit.BTC.address
            return address
        }
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
        return amount
    }

    async getTransactions() {
        try {
            let res = await this.provider.getTransactions({
                start: 0,
                limit: 100
            })
            let transactions = res.data.transactions;
            return this.getCostOfRental(transactions)
        } catch(e) {
            console.log(this.timestamp(), ' Error during getTransactions timer.js: ',e)
        }
    }

    async getNetworkhashrate() {
        let Percent = this.userOptions.Xpercent / 100
        try {
            const Networkhashrate = ( await Rent(this.userOptions.token, Percent) ).Networkhashrate
            const RentNext = (Networkhashrate - this.userOptions.hashrate) * ( - Percent / ( - 1 + Percent ) )
            return RentNext
  
        } catch(err) {
            console.log(err)
            return 0
        }
    }

    async nextRental() {
        console.log('Next Rental Started')
        const Networkhashrate = await this.getNetworkhashrate()
        const accessToken = this.req.headers['x-auth-token']
        let config = {
            headers: {
                'x-auth-token': accessToken,
            }
        }
        
        this.options.hashrate = Networkhashrate
        this.options.nextRental = true

        try {
            const response = await axios.post(API_URL+'/rent', this.options, config)
            console.log('RESPONSE axios Timer.js', response.data)
        } catch(err) {
            console.log(err)
        }
    }

    
    setTimer() {
        this.options = JSON.parse(JSON.stringify(this.userOptions, getCircularReplacer()))
        setTimeout(() => {
            this.nextRental()
        }, this.duration * 60 * 60 * 1000)
    // }, this.duration * 1000)
        
        console.log(this.timestamp(), 'Timer started')
        setTimeout(async () => {
            try {
                this.options.duration = this.duration
                let address = await this.getProviderAddress()
                let payout = await on(this.req, address, this.options)

                console.log(this.timestamp(), ' payout:', payout)
                console.log(this.timestamp(), 'this.options duration: ', this.options.duration)

                this.emitter.emit('message', JSON.stringify({
                    userId: this.userId,
                    message: 'Auto trading is starting...'
                }))
            } catch(e) {
                console.log(this.timestamp(), ' ERROR', e)
                this.emitter.emit('message', JSON.stringify({
                    userId: this.userId,
                    autoRent: false,
                    message: e
                }))
            }
            setInterval(async () => {    
                if (this.provider.constructor.name === 'MRRProvider') {
                    try{
                        let CostOfRentalBtc = await this.getTransactions()
                        console.log(this.timestamp(), ' CostOfRentalBtc:', Math.abs(CostOfRentalBtc).toFixed(8))     
                        
                        this.emitter.emit('message', JSON.stringify({
                            userId: this.userId,
                            db: {CostOfRentalBtc: Math.abs(CostOfRentalBtc).toFixed(8)}
                        }))
                    } catch(e) {
                        console.log(e)
                    }
                }
            },5 * 60 * 1000 )
        },1 * 55 * 60 * 1000)
    // },20 * 1000 )
    // },1000)
    }
}

module.exports = Timer


