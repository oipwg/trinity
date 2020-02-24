import axios from 'axios';
import { returnErrors } from './errorAction';

import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
} from './types';

const config = {
    headers: {
        'Content-Type': 'application/json',
    },
};

// Check token & load user
export const loadUser = () => (dispatch, getState) => {
    // User loading
    dispatch({
        type: USER_LOADING,
    });

    axios
        .get('http://localhost:5000/users/user', tokenConfig(getState))
        .then(res => {
            dispatch({
                type: USER_LOADED,
                payload: res.data,
            });
        })
        .catch(err => {
            dispatch(returnErrors(err.response.data, err.response.status));
            dispatch({
                type: AUTH_ERROR,
            });
        });
};

// Register User
export const signup = (
    { userName, email, password, mnemonic },
    props
) => dispatch => {
    // headers
    // const config = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // };

    // request body
    const body = JSON.stringify({
        userName,
        email,
        password,
        mnemonic,
    });

    axios
        .post('http://localhost:5000/users/signup', body, config)
        .then(res => {
            console.log('signup', res);
            dispatch({
                type: SIGNUP_SUCCESS,
                payload: res.data,
            });

            return props.push('/setup');
        })
        .catch(err => {
            console.log('sign up', err);
            dispatch(
                returnErrors(
                    err.response.data,
                    err.response.status,
                    'SIGNUP_FAIL'
                )
            );

            dispatch({
                type: SIGNUP_FAIL,
            });
        });
};

// Login User
export const loginUser = ({ userName, password }, props) => dispatch => {
    const body = JSON.stringify({
        userName,
        password,
    });

    axios
        .post('http://localhost:5000/users/login', body, config)
        .then(res => {
            console.log('login', res);
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data,
            });

            return props.push('/setup');
        })
        .catch(err => {
            console.log('login err', err);
            dispatch(
                returnErrors(
                    err.response.data,
                    err.response.status,
                    'LOGIN_FAIL'
                )
            );

            dispatch({
                type: LOGIN_FAIL,
            });
        });
};

// Setup config/headers and token
export const tokenConfig = getState => {
    // Get token from localstorage
    const token = getState().auth.token;

    // headers
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        config.headers['x-auth-token'] = token;
    }

    return config;
};
