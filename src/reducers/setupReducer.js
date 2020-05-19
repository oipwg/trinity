import { 
    ADD_PROVIDER, 
    PROVIDER_DATA,
    LOGOUT_SUCCESS,
    LOGIN_FAIL,
    SIGNUP_FAIL,
} from '../actions/types';

const initState = [];
export const setupReducer = (state = initState, action) => {
    switch (action.type) {
        case ADD_PROVIDER:
            return action.payload
        case LOGOUT_SUCCESS:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
            return [];
        default:
            return state;
    }
};
export const login = (state = initState, action) => {
    switch (action.type) {
        case PROVIDER_DATA:
            return action.payload
        case LOGOUT_SUCCESS:
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
            return [];

        default:
            return state;
    }
};
