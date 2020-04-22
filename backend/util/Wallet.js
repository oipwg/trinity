const HDMW = require('@oipwg/hdmw');
const Wallet = HDMW.Wallet;

class NewWallet {
    constructor(mnemonic) {
        this.mnemonic = mnemonic
        this.createAddress = this.createAddress.bind(this);
    }
    async createAddress() {
        const myWallet =  await new Wallet("juice develop vibrant march mango puzzle place tobacco off shoe citizen flat", {
            supported_coins: ['flo']
          });

        let addresses = myWallet.coins.flo.accounts[0].addresses
        console.log('myWallet:', addresses )
        return addresses  
    }
}
// let mnemonic = 'juice develop vibrant march mango puzzle place tobacco off shoe citizen flat'
let mnemonic = "exclude humor denial unfold join buyer price regret obey zone welcome tobacco"
let newWallet = new NewWallet(mnemonic)

// console.log('newWallet:', newWallet.createAddress())


module.exports = NewWallet