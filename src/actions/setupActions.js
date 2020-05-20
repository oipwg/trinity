import { ADD_PROVIDER, BITTREX_DATA } from './types';

export const addProvider = (data = []) => {    
    return{
        type: ADD_PROVIDER,
        payload: data
    }
}

export const addBittrex = (data = {}) => {    
    return {
        type: BITTREX_DATA,
        payload: data
    }
}