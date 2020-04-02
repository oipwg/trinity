import HDMW from 'oip-hdmw';
const Wallet = HDMW.Wallet;
// import { buildOipDetails, recordProtoBuilder } from 'oip-protobufjs';

class NewWallet {
    constructor() {
        this.myWallet = new Wallet('', {
            supported_coins: ['flo'],
            discover: false,
        });
        this.createMnemonic = this.createMnemonic.bind(this);
    }

    async createMnemonic() {
        let mnemonic = await this.myWallet.getMnemonic();
        console.log('My Mnemonic: ' + mnemonic);
        return mnemonic;
    }
}

export default new NewWallet();
