import { DAILY_BUDGET, ADD_PROVIDER, PROVIDER } from '../actions/types';

let initState = {}
export const miningOperationsReducer = (state = initState, action) => {

    switch (action.type) {
        case DAILY_BUDGET:
            console.log(action.payload)
            return {dailyBudget: action.payload}
        case PROVIDER:
            console.log('miningOperationsReducer:', action.payload)
            return {...state, ...action.payload}
        default:
            return {dailyBudget: false};
    }
};