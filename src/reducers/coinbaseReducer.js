import {
    GET_COINBASE_ACCOUNT,
    COINBASE_LOADED,
    COINBASE_LOADING,
    GET_COINBASE_ADDYS,
    GET_COINBASE_BUYS,
    GET_COINBASE_PAYMENT_METHODS,
    COINBASE_SUCCESS,
    COINBASE_FAIL,
    LOGOUT_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_FAIL,
    PLACE_BUYORDER,
    PLACE_BUYORDER_FEES,
} from '../actions/types';

const initState = {
    coinbaseLoaded: null,
    coinbaseisLoading: false,
    accounts: null,
    buys: null,
    paymentMethods: null,
};

const coinbaseReducer = (state = initState, action) => {
    switch (action.type) {
        case COINBASE_LOADING:
            return {
                ...state,
                coinbaseisLoading: true,
            };
        case COINBASE_LOADED:
        case COINBASE_SUCCESS:
        case GET_COINBASE_ACCOUNT:
            return {
                ...state,
                coinbaseLoaded: true,
                coinbaseisLoading: false,
                accounts: action.payload,
            };
        case GET_COINBASE_ADDYS:
            return {
                ...state,
                addresses: action.payload,
            };
        case GET_COINBASE_BUYS:
            return {
                ...state,
                buys: action.payload,
            };

        case GET_COINBASE_PAYMENT_METHODS:
            return {
                ...state,
                paymentMethods: action.payload,
            };
        case LOGIN_FAIL:
        case LOGOUT_SUCCESS:
        case SIGNUP_FAIL:
        case COINBASE_FAIL:
            return {
                ...state,
                accounts: null,
                coinbaseLoaded: null,
                coinbaseisLoading: false,
                buys: null,
                paymentMethods: null,
            };

        // orders

        default:
            return state;
    }
};

export default coinbaseReducer;
