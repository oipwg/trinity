// @ts-nocheck

const rent = require('./rent/rent');
const add = require('./RentalProvider/add/add');
const clearSpartanBot = require('./RentalProvider/clearSpartanBot');
const SpartanBot = require('spartanbot').SpartanBot;
const Events = require('events').EventEmitter;
const Timer = require('../helpers/timer');
const User = require('../models/user');
const emitter = new Events();
const wss = require('../routes/socket');
const { Rent, getPriceBtcUsd, AutoRentCalculatons } = require('../helpers/rentValues');


class Client {
    constructor(res) {
        this.res = res
        this.users = []
        this.loadMessages()
        this.newSpartan = async (userName, userId, returnUser) => {
            let spartan = new SpartanBot()
            this.users.push({
                name: userName,
                id: userId.toString(),
                spartan: spartan,
                emitter: emitter,
                autoRentCalculatons : new AutoRentCalculatons(spartan),
                timer: Timer
            })
            if(returnUser) {
                let user = this.users[this.users.length-1] 
                returnUser(user)
            }
        }
    }

    async getDataBaseUser(userId) {
        try {
            return await User.findById({ _id: userId})
        } catch (err) {
            throw new Error('User not found during getDataBaseUser in index.js')
        }

    }

    loadMessages() {
        wss.on('connection', ws => {
            emitter.on('message', msg => {
                ws.send(msg);
            })
        })
    }

    // updates the options object with new properties made by this.newSpartan
    async asignNewProperties(user, options) {
        let userDB = await this.getDataBaseUser(options.userId)

        user.spartan.renting = options.autoRent
        options.SpartanBot = user.spartan
        options.emitter = user.emitter
        options.Timer = user.timer
        options.User = userDB
        options.autoRentCalculations = user.autoRentCalculatons
    }
            
    async getUser({userName, userId}) {

        let users = this.users
        let i = users.length
        let updatedUser;
        
        // If users array is empty will make new user / spartanbot and return it
        if(!users.length) {
            let data = await this.newSpartan(userName, userId, (newUser) => {
                updatedUser = newUser
            })
            return updatedUser
        }
        
        while(i--) {
            let user = users[i]
            if (user.id === userId) {
                return user
            //If user doesn't exist in users array (no providers), make a new user and return it.
            } else if (!i) {
                await this.newSpartan(userName, userId, (newUser) => {
                    updatedUser = newUser
                })
                return updatedUser
            }
        }
    }
    // Sign out
    removeUser(userId) {
        let users = this.users
        let i = users.length

        while(i--) {
            let user = users[i]
            if (user.id === userId) {
                this.users.splice(i,1)
                return this.users
            }
        }
    }

    // Remove spartanbot from user 
    stopRental(userId) {

    }

    async controller(options) {
        let user = await this.getUser(options)
        await this.asignNewProperties(user, options)
        
        console.log('options.userName', options.userName)
        console.log('this.users', this.users)

        switch (options.to_do) {
            case 'rent':
                try {
                    return await rent(options)
                }catch (err) {
                    return err
                }
            case 'add':
                try {
                    return await add(options)
                } catch (err) {
                    return err
                }
            case 'clearSpartanBot':
                let removedUser = this.removeUser(options.userId)
                console.log('Current Users after signout:', removedUser)
                return removedUser
                // return clearSpartanBot(options)
            case 'returnSpartanBot': 
                 return options
            case 'stopRental': 
                let rentalCleared = this.stopRental(options.userId)
                return options
             
        }
    }
}
module.exports = {
    Client: new Client(),
    emitter: emitter
}

