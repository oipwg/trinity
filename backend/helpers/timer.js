const { on } = require('../controllers/autoTrade');
const User = require('../models/user');

/**
 * Class to start a timer to gather data at end of rental
 */
class Timer {
    /**
     * 
     * @param {Object} settings Information to be used for timer
     * @param {Object} req Request object to be passed off later
     */
    constructor(settings, req) {
        console.log('settings:', settings)
        this.name = settings.name
        this.profiles = settings.profiles
        this.duration = settings.duration
        this.profileId = settings.profile_id
        this.provider = settings.badge[0].provider
        this.req = req
        this.ids = settings.rentalId
        this.emitter = settings.emitter
        this.userId = settings.userId
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

    
    setTimer() {
        let name = this.name
        console.log(this.timestamp(),'THIS NAME', name)
        setTimeout(async () => {
            try {
                let address = await this.getProviderAddress()
                let payout = await on(this.req, address, name)
                console.log(this.timestamp(), ' payout:', payout)

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
            },20 * 1000 )
        // },3 * 55 * 60 * 1000)
    },1000)
    }
}

module.exports = Timer


