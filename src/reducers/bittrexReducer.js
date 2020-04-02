import {
    // BITTREX_LOADED,
    // BITTREX_LOADING,
    GET_BITTREX_ADDYS,
    GET_BITTREX_EX_PRICES,
    GET_BITTREX_BALANCES,
    GET_BITTREX_OPENORDERS,
    GET_BITTREX_SALESHISTORY,
    GET_BITTREX_RVN_EX_PRICE,
    GET_BITTREX_FLO_EX_PRICE,
    BITTREX_WITHDRAW,
    LOGOUT_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_FAIL,
    } from '../actions/types'


const initState = {
    bittrexLoaded: null,
    bittrexisLoading: false,
    balances: null,
    addresses: null,
    orderBook: null,
    exchangePrice: null,
    openOrders: null,
    salesHistory: null,
}


const bittrexReducer = (state = initState, action ) => {
    switch(action.type) {
        case GET_BITTREX_ADDYS:
            return {
                ...state,
                addresses: action.payload
            }
        case GET_BITTREX_EX_PRICES:
            return {
                ...state,
                exchangePrice: action.payload
            }
        case GET_BITTREX_BALANCES: 
            return {
                ...state,
                balances: action.payload
            }
        case GET_BITTREX_OPENORDERS: 
            return {
                ...state,
                openOrders: action.payload
            }
        case GET_BITTREX_SALESHISTORY: 
            return {
                ...state,
                salesHistory: action.payload
            }



        case LOGOUT_SUCCESS:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
            return {
                ...state,
                bittrexLoaded: null,
                bittrexisLoading: false,
                balances: null,
                addresses: null,
                orderBook: null,
                exchangePrice: null,
                openOrders: null,
                salesHistory: null,
            }
        
        default:
            return state;
        
    }
}


export default bittrexReducer;