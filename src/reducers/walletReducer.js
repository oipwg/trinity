import {
    WALLET_LOADED,
    WALLET_LOADING,
    WALLET_ERROR,
    WALLET_SUCCESS,
    GET_BALANCE,
    GET_EXCHANGE_RATE,
    LOGOUT_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_FAIL,
} from '../actions/types';

const initState = {
    wallet: null,
    walletLoaded: null,
    walletisLoading: false,
    exchangeRate: null,
    balance: null,
};

const walletReducer = (state = initState, action) => {
    switch (action.type) {
        case WALLET_LOADING:
            return {
                ...state,
                walletisLoading: true,
            };
        case WALLET_LOADED:
        case WALLET_SUCCESS:
            return {
                ...state,
                walletLoaded: true,
                walletisLoading: false,
                wallet: action.payload,
            };
        case GET_BALANCE:
            return {
                ...state,
                balance: action.payload,
            };
        case GET_EXCHANGE_RATE:
            return {
                ...state,
                exchangeRate: action.payload,
            };

        case LOGIN_FAIL:
        case LOGOUT_SUCCESS:
        case SIGNUP_FAIL:
        case WALLET_ERROR:
            return {
                ...state,
                wallet: null,
                walletLoaded: null,
                walletisLoading: false,
                exchangeRate: null,
                balance: null,
            };

        default:
            return state;
    }
};

export default walletReducer;
