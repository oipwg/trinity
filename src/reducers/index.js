import { combineReducers } from 'redux';

import errorReducer from './errorReducer';
import authReducer from './authReducer';
import successReducer from './successReducer';
import walletReducer from './walletReducer';
import coinbaseReducer from './coinbaseReducer';
import bittrexReducer from './bittrexReducer';

export default combineReducers({
    error: errorReducer,
    auth: authReducer,
    success: successReducer,
    account: walletReducer,
    coinbase: coinbaseReducer,
    bittrex: bittrexReducer
});
