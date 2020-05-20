import { ADD_PROVIDER, PROVIDER_DATA, BITTREX_DATA } from '../actions/types';

const initState = [];
export const setupReducer = (state = initState, action) => {
    switch (action.type) {
        case ADD_PROVIDER:
            return action.payload
        default:
            return state;
    }
};
export const login = (state = initState, action) => {
    switch (action.type) {
        case PROVIDER_DATA:
            return action.payload
        default:
            return state;
    }
};

export const setupBittrex = (state = {}, action) => {
    switch (action.type) {
        case BITTREX_DATA:
            console.log(action.payload)
            return action.payload
        default:
            return state;
    }
};
