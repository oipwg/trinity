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


// Setup config/headers and token
const getAccessToken = (getState, cb2Fa ) => {
    const aToken = getState().auth.user.coinbase.accessToken;

    // headers
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (aToken) {
        config.headers['Authorization'] = `Bearer ${aToken}`;
    }

    if(cb2Fa){
        config.headers['CB-2FA-TOKEN'] = cb2Fa
    }

    console.log(config)

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
            console.log(res);
            dispatch({
                type: GET_COINBASE_ACCOUNT,
                payload: res.data,
            });
        })
        .catch(err => {
            console.log(err);
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
            console.log(res);
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
        .catch(err => console.log(err));
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
            console.log(err);
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
        return console.log(err);
    }
};