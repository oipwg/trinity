// import axios from 'axios';

// Might not need this
import { decrypt } from '../helpers-functions/crypto';
import HDMW from '@oipwg/hdmw';
const Wallet = HDMW.Wallet;	
import * as bip32 from 'bip32'
import { Account, Networks } from '@oipwg/hdmw'

import {
    WALLET_LOADED,
    WALLET_LOADING,
    // WALLET_ERROR,
    // WALLET_SUCCESS,
    GET_BALANCE,
    GET_EXCHANGE_RATE,
} from './types';

export const loadWallet = (encryptedMnemonic, password) => dispatch => {
    dispatch({
        type: WALLET_LOADING,
    });

    const mnemonic = decrypt(encryptedMnemonic, password);

    const getWallet = new Wallet(mnemonic, { supported_coins: ['flo'] });

    const flo = getWallet.getCoin('flo')
    const floAccount = flo.getAccount(1)
    const prv = floAccount.getExtendedPrivateKey();

    dispatch({
        type: WALLET_LOADED,
        payload: getWallet,
    });


    //todo: discover new chains - get balance - add it to account[0];
    const account = new Account(bip32.fromBase58(prv, Networks.flo.network), Networks.flo, false)
    account.discoverChains().then((acc) => {
        console.log(acc.getChain(0).addresses)
        console.log(acc.getChain(1).addresses)
    })

    account.getBalance({ discover: true }).then((balance) => {
        console.log('balanceeeeee!!!!!------',balance);
    })




    getWallet.getCoinBalances().then(res => {
        dispatch({
            type: GET_BALANCE,
            payload: res,
        });
    });

    getWallet.getExchangeRates(['flo', 'litecoin'], 'usd').then(res =>
        dispatch({
            type: GET_EXCHANGE_RATE,
            payload: res,
        })
    );

};

export const getBalance = (wallet) => dispatch => {
    wallet.getCoinBalances().then(res => {
        dispatch({
            type: GET_BALANCE,
            payload: res,
        });
    });
}

