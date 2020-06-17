import { DAILY_BUDGET, ADD_PROVIDER, PROVIDER } from '../actions/types';

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