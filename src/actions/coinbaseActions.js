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

// this will get pulled from user's account.
const accesstoken =
    '1a9c487ed4db38d4654e2c11d029757e0ac753d6dfe7e0c48a213ebc1e52118e';

// Setup config/headers and token
const getAccessToken = getState => {
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
