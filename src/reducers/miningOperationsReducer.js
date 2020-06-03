import { DAILY_BUDGET } from '../actions/types';


export const miningOperationsReducer = (state = {}, action) => {
    // console.log('state:', action.payload)
    switch (action.type) {
        case DAILY_BUDGET:
            console.log(action.payload)
            return {dailyBudget: action.payload}

        default:
            return {dailyBudget: false};
    }
};