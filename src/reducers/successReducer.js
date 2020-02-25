import { GET_SUCCESS, CLEAR_SUCCESS } from '../actions/types';

const initState = {
    msg: {},
    status: null,
    id: null,
};

const successReducer = (state = initState, action) => {
    switch (action.type) {
        case GET_SUCCESS:
            return {
                msg: action.payload.msg,
                status: action.payload.status,
                id: action.payload.id,
            };
        case CLEAR_SUCCESS: {
            return {
                msg: {},
                status: null,
                id: null,
            };
        }
        default:
            return state;
    }
};

export default successReducer;
