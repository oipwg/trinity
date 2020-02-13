const spartanBot = require('spartanbot')
const HDMW = require('oip-hdmw')
const Wallet = HDMW.Wallet
const account = require('oip-account').Account

let exchange = require('oip-exchange-rate') //bitcoint exchange rate

let SpartanBotSettings = {
    mnemonic:
        'prevent hobby solution exact warfare gasp banner old odor april impact eyebrow',
}

let AutoRenterSettings = {
    rental_providers: 'MiningRigRentals',
    hashrate: 1762487,
    duration: 1467067237,
}

let spartanbot = new spartanBot.SpartanBot()

// console.log(autorenter)
console.log(spartanbot)
