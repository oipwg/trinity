import { ADD_PROVIDER, PROVIDER, PERCENT_MODAL, RETURNED_RENT_VALUES } from '../actions/types';

let initState = {}
export const miningOperationsReducer = (state = initState, action) => {
    switch (action.type) {
        case PROVIDER:
            return {...state, ...action.payload}
        default:
            return {dailyBudget: false};
    }
};

export const percentModalReducer = (state = initState, action) => {

    switch (action.type) {
        case PERCENT_MODAL:
            console.log(action.payload)
            return {...state, percentModalopen: action.payload}
        default:
            return state
    }
};

export const returnedRentValues = (state = initState, action) => {
    switch (action.type) {
        case RETURNED_RENT_VALUES:
            console.log(action.payload)
            return {...state, options: action.payload}
        default:
            return state
    }
};