import axios from 'axios';
import { API_URL } from '../../config';
import { tokenConfig } from './authActions';


import {
BITTREX_LOADED,
BITTREX_LOADING,
GET_BITTREX_ADDYS,
GET_BITTREX_EX_PRICES,
GET_BITTREX_RVN_EX_PRICE,
GET_BITTREX_FLO_EX_PRICE,
BITTREX_WITHDRAW,
GET_BITTREX_BALANCES,
GET_BITTREX_OPENORDERS,
GET_BITTREX_SALESHISTORY,
} from './types'


const bittrex = axios.create({
    baseURL: 'https://api.bittrex.com/api/v1.1',
    timeout: 1000,
});

export const getLatestExPrice = () => (dispatch, getState) => {


}

export const getBittrexBalances = () => async (dispatch, getState) => {
    try {
        const res = await axios.get(`${API_URL}/bittrex/getBalance`, tokenConfig(getState))
        
        dispatch({
            type: GET_BITTREX_BALANCES,
            payload: res.data.result
        })

    } catch (error) {
        console.log(error.response)
    }
}

export const getOpenOrder = () => async(dispatch,getState) => {
    try {
        const res = await axios.get(`${API_URL}/bittrex/openOrders`, tokenConfig(getState))
        console.log(res);

        dispatch({
            type: GET_BITTREX_OPENORDERS,
            payload: res.data.openOrders
        })

    } catch (error) {
        console.log(error.response)
    }
}

export const getSalesHistory = () => async(dispatch,getState) => {
    try {
        const res = await axios.get(`${API_URL}/bittrex/salesHistory`, tokenConfig(getState))

        dispatch({
            type: GET_BITTREX_SALESHISTORY,
            payload: res.data.salesHistory
        })

    } catch (error) {
        console.log(error.response)
    }
}