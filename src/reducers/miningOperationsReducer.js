import { DAILY_BUDGET, ADD_PROVIDER, PROVIDER, PERCENT_MODAL } from '../actions/types';

let initState = {}
export const miningOperationsReducer = (state = initState, action) => {

    switch (action.type) {
        case DAILY_BUDGET:
            return {dailyBudget: action.payload}
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