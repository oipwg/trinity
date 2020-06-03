const { on } = require('../controllers/autoTrade');
const User = require('../models/user');
const spartanbot = require('spartanbot')
const wss = require(process.cwd() + '/backend/routes/socket').wss;
const events = require('events');
const emitter = new events();

wss.on('connection', ws => {
  emitter.on('message', msg => {
    ws.send(msg);
  });
});

const timestamp = () => {
	let date = new Date()
	    return date.getFullYear() + "-" +
		   (date.getMonth() + 1) + "-" +
		   date.getDate() + " " +
		   date.getHours() + ":" +
		   date.getMinutes() + ":" +
		   date.getSeconds()
}

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
        this.profiles = settings.profiles
        this.duration = settings.duration
        this.profileId = settings.profile_id
        this.provider = settings.badge[0].provider
        this.req = req
        this.ids = settings.rentalId
    }

    // Formated Date string
    timestamp() {
		let date = new Date()
	    return date.getFullYear() + "-" +
		   (date.getMonth() + 1) + "-" +
		   date.getDate() + " " +
		   date.getHours() + ":" +
		   date.getMinutes() + ":" +
		   date.getSeconds()
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

    async getProviderAddress() {
        let account = ( await this.provider.getAccount() ).data.deposit.BTC.address
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
            return this.getCostOfRental(transactions)
        } catch(e) {
            console.log(timestamp(), ' Error during getTransactions timer.js: ',e)
        }
    }

    
    setTimer() {
        setTimeout(async () => {
            try {
                let address = await this.getProviderAddress()
                let payout = await on(this.req, address)
                console.log(timestamp(), ' payout:', payout)
                emitter.emit('message', JSON.stringify({
                    message: 'Auto trading is starting...'
                }))
                
            } catch(e) {
                console.log(this.timestamp(), ' ERROR', e)
                emitter.emit('message', JSON.stringify({
                    autoRent: false,
                    message: e
                }))
            }
            setInterval(async ()=> {
                try{
                    let CostOfRentalBtc = await this.getTransactions()
                    console.log(timestamp(), ' CostOfRentalBtc:', CostOfRentalBtc)     
                    
                    emitter.emit('message', JSON.stringify({
                        db: {CostOfRentalBtc: Math.abs(CostOfRentalBtc).toFixed(8)}
                    }))
                } catch(e) {
                    console.log(e)
                }
            },5 * 60 * 1000 )
        },3 * 55 * 60 * 1000)
    // },1000)

    }
}

module.exports = Timer


