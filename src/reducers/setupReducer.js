import { ADD_PROVIDER } from '../actions/types';

const initState = [];
const setupReducer = (state = initState, action) => {
    switch (action.type) {
        case ADD_PROVIDER:
            return action.payload
       
        default:
            return state;
    }
};

export default setupReducer;