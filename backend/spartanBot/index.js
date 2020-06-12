// @ts-nocheck

const rent = require('./rent/rent');
const add = require('./RentalProvider/add/add');
const attachSpartanBot = require('./RentalProvider/returnSpartanBot.js')
const clearSpartanBot = require('./RentalProvider/clearSpartanBot');
const SpartanBot = require('spartanbot').SpartanBot;

class Client {
    constructor(settings) {
        this.settings = settings
        this.users = []
        this.newSpartan = (name) => {
            this.users.push({
                name: name,
                spartan: new SpartanBot(),
                version: this.Version()
            })     
        }
        this.Version = () => {
            this.version = Math.floor(Math.random() * 4000)
        }
    }
    getUser(name) {
        let users = this.users
        let i = users.length
        while(i--) {
            let user = users[i]
            if (user.name === name) {
                return user
            }
        }
    }
    get(version) {
        console.log('VERSION: ',this.version)
    }

    async controller(options) {
        let user = this.getUser(options.userName)
        console.log('returned user:', user)
        console.log('this.users', this.users)
        console.log('this.name', this.name)
        console.log('options.userName', options.userName)
        // if (this.name === undefined || this.name !== options.userName) {
        //     console.log('NEW SPARTAN MADE')
        //     this.spartan = new SpartanBot(userName)
        // }

        let to_do = options.to_do
        options.SpartanBot = user.spartan
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

