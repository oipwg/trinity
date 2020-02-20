import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUY_SUCCESS,
    SIGNUP_SUCCESS,
    REGISTER_FAIL,
} from '../actions/types';

const initState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    isLoading: false,
    user: null,
};

const authReducer = (state = initState, action) => {
    switch (action.type) {
        case USER_LOADING:
            return {
                ...state,
                isLoading: !isLoading,
            };
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: !isAuthenticated,
                isLoading: !isLoading,
                user: action.payload,
            };

        default:
            return state;
    }
};

export default authReducer;
