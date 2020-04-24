import axios from 'axios';

import {
    GET_COINBASE_ACCOUNT,
    COINBASE_LOADED,
    COINBASE_LOADING,
    GET_COINBASE_ADDYS,
    GET_COINBASE_BUYS,
    GET_COINBASE_PAYMENT_METHODS,
    COINBASE_SUCCESS,
    COINBASE_FAIL,
    GET_ERRORS,
    GET_SUCCESS,
} from './types';

// import { tokenConfig } from '../helpers/headers';
import { tokenConfig } from './authActions'
import { API_URL } from '../../config';


// Setup config/headers and acess token for making a request
const getAccessToken = (getState, cb2Fa ) => {
    const aToken = getState().auth.user.coinbase.accessToken;

    // headers
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'CB-VERSION': '2020-02-12'
        },
    };

    if (aToken) {
        config.headers['Authorization'] = `Bearer ${aToken}`;
    }

    if(cb2Fa){
        config.headers['CB-2FA-TOKEN'] = cb2Fa
    }

    return config;
};

const coinbase = axios.create({
    baseURL: 'https://api.coinbase.com/v2',
    timeout: 1000,
});

export const listAccounts = () => (dispatch, getState) => {
    dispatch({
        type: COINBASE_LOADING,
    });

    coinbase
        .get('/accounts', getAccessToken(getState))
        .then(res => {
            dispatch({
                type: GET_COINBASE_ACCOUNT,
                payload: res.data,
            });
        })
        .catch(err => {
            console.log(err.response);
            
            dispatch({
                type: GET_ERRORS,
                payload: err.response,
            });
        });
};

export const listPaymentMethods = () => (dispatch, getState) => {
    coinbase
        .get('/payment-methods', getAccessToken(getState))
        .then(res => {
            dispatch({
                type: GET_COINBASE_PAYMENT_METHODS,
                payload: res.data,
            });
        })
        .catch(err => {
            console.log(err.response);
            // dispatch({
            //     type: GET_ERRORS,
            //     payload: err.reponse,
            // });
        });
};

export const placeBuyOrderWithoutFees = (
    walletId,
    amount,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) =>  (dispatch, getState) => {
    

    console.log('walletId placeBuyoeswe', walletId)

    const body = JSON.stringify({
        amount,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    return coinbase
        .post(`accounts/${walletId}/buys`, body, getAccessToken(getState))
        .then(res => {
            console.log(res);
            return res;
        })
        .catch(err => console.log(err.response));
};

//************* Send Funds **********/
// wallet:transactions:send
// request requires a CB-2FA header
export const sendFunds = (walletId,to, amount, currency, description, fee, idem, cb2Fa) => 
    (dispatch, getState) => 
{
    const body = {
        type: 'send',
        to,
        amount,
        currency,
        description,
        fee,
        idem,
        to_financial_institution: false,
    };

    console.log(body)

    return coinbase
        .post(`accounts/${walletId}/transactions`, body, getAccessToken(getState, cb2Fa))
        .then(res => {
            console.log(res);
            return res
        })
        .catch(err => {
            console.log(err.response);
        });
};

//*** Selling ***/ - need resource id
// wallet:sells:create
// Fees amout not included in order
export const placeSellOrderWithoutFees = (
    walletId,
    amount,
    currency,
    payment_method = null,
    agree_btc_amount_varies = false,
    quote = true
) =>  async (dispatch, getState) => {
    const body = JSON.stringify({
        amount,
        currency,
        payment_method,
        agree_btc_amount_varies,
        quote,
    });

    try {
        const res = await coinbase.post(`accounts/${walletId}/sells`, body, getAccessToken(getState));
        console.log(res);
        return res;
    } catch (err) {
        return console.log(err.response);
    }
};

export const getCoinbaseBTCUSD = () => {

    coinbase
        .get('/exchange-rates?currency=BTC')
        .then(res => {
            return res.data
        })
        .catch(err => {
            console.log(err.response);
        });
};



        // Working
        // listAccounts(); //coinbase - wallet accounts BTC, ETH, USD, etc.,
        // --
        // placeBuyOrderWithoutFees('2.00', 'USD'); // quote default
        // placeBuyOrderWithFees(null, '2.00', 'USD'); // quote default
        // --
        // placeSellOrderWithoutFees('1.00', 'USD');
        // placeSellOrderWithFees(null, '2.00', 'USD');
        // --
        // withDrawFunds(
        //     '32de22c2-5513-543f-85c7-1d2f968bb922',
        //     '0.01',
        //     'USD',
        //     'd80982a6-0d39-56e6-bfca-2042d90fbb4a'
        // ); // at least $!
        // listPaymentMethods();
        // listBuysForAnAcc();
        // sendFunds(
        //     '1PSuvt641rsJm4RF4swAxMAa4zhNpzqJLt',
        //     '1.00',
        //     'USD',
        //     'testing',
        //     null,
        //     'testuno'
        // );
        //! Not Working
        //todo: Testing
        // listAddysforAccount();
        // showOneAddyforAccount();
