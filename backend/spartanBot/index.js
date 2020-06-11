// @ts-nocheck

const rent = require('./rent/rent');
const add = require('./RentalProvider/add/add');
const attachSpartanBot = require('./RentalProvider/returnSpartanBot.js')
const clearSpartanBot = require('./RentalProvider/clearSpartanBot');
const SpartanBot = require('spartanbot').SpartanBot;

class Client {
    constructor(settings) {
        this.settings = settings
        this.newSpartan = (name) => {
   
            console.log('name:', name)
            this.name = name
            this.spartan = new SpartanBot()
        }
        this.Version = () => {
            this.version = Math.floor(Math.random() * 4000)
        }
        console.log('CLIENT', this.spartan)
        this.get()
    }

    get(version) {
        this.Version()
        console.log('VERSION: ',this.version)
    }

    async controller(options) {
        console.log('this.name', this.name)
        console.log('options.userName', options.userName)
        if (this.name === undefined || this.name !== options.userName) {
            this.spartan = new SpartanBot()
        }
        console.log('this.version', this.version)
        
        let to_do = options.to_do
        options.SpartanBot = this.spartan
        switch (to_do) {
            case 'rent':
                try {
                    return await rent(options)
                } catch (err) {
                    return err
                }
            case 'add':
                try {
                    return await add(options)
                } catch (err) {
                    return err
                }
            case 'clearSpartanBot':
                return clearSpartanBot(options)
                break;
            case 'returnSpartanBot': 
                return options
                // let data = await attachSpartanBot(options)
                // return options
                break;
        }
    }
}
module.exports = new Client()

