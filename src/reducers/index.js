import { combineReducers } from 'redux';

import errorReducer from './errorReducer';
import authReducer from './authReducer';
import successReducer from './successReducer';
import walletReducer from './walletReducer';
import coinbaseReducer from './coinbaseReducer';
import bittrexReducer from './bittrexReducer';
import profilesReducer from './profileReducer';
import {setupReducer, login, setupBittrex } from './setupReducer';

export default combineReducers({
    error: errorReducer,
    auth: authReducer,
    success: successReducer,
    account: walletReducer,
    coinbase: coinbaseReducer,
    bittrex: bittrexReducer,
    profiles: profilesReducer,
    userData: setupReducer,
    login: login,
    setupBittrex: setupBittrex
});
