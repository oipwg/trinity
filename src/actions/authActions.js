import axios from 'axios';
import { returnErrors } from './errorAction';
import { API_URL } from '../../config';
import { returnSuccess } from './successAction';
import { getProfile } from './profileActions'

import {
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ADD_PROVIDER,
    PROVIDER_DATA,
    CHANGE_PW_FAIL,
    CHANGE_PW_SUCCESS,
    // On Load
    PROFILE_GET

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
        .get(`${API_URL}/users/user`, tokenConfig(getState))
        .then(res => {
            dispatch({
                type: USER_LOADED,
                payload: res.data,
            });
            if(res.data) {
                dispatch({
                    type: PROVIDER_DATA,
                    payload: res.data.providerData
                });
            }
           
        }).then(() => {
            dispatch(getProfile())
        })
        .catch(err => {
            //todo: handle error - currently returns undefined
            console.log(err, err.response)
            dispatch(returnErrors(err.response, err.response.status));
            dispatch({
                type: AUTH_ERROR,
            });
        });
};

// Register User
export const signup = (
    { userName, email, password, mnemonic, wallet },
    history
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
        wallet
    });

    axios
        .post(`${API_URL}/users/signup`, body, config)
        .then(res => {
            dispatch({
                type: SIGNUP_SUCCESS,
                payload: res.data,
            });

            return history.push('/setup');
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

export const changePassword = ({ id, oldPassword, password, mnemonic }) => (
    dispatch,
    getState
) => {
    const body = JSON.stringify({
        id,
        oldPassword,
        password,
        mnemonic,
    });

    console.log(body);

    axios
        .post(`${API_URL}/users/changepassword`, body, tokenConfig(getState))
        .then(res => {
            console.log('changepassword', res);

            dispatch(returnSuccess(res.data, res.status, 'CHANGE_PW_SUCCESS'));
        })
        .catch(err => {
            console.log('changepassword', err);
            dispatch(
                returnErrors(
                    err.response.data,
                    err.response.status,
                    'CHANGE_PW_FAIL'
                )
            );
            //todo: change state?
            // dispatch({
            //     type: CHANGE_PW_FAIL,
            // });
        });
};

// Login User
export const loginUser = ({ userName, password }, history) => dispatch => {
    const body = JSON.stringify({
        userName,
        password,
    });

    axios
        .post(`${API_URL}/users/login`, body, config)
        .then(res => {
            console.log('login', res);
            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data,
            });
            dispatch({
                type: PROVIDER_DATA,
                payload: res.data.user.providerData,
            });
            return history.push('/setup');
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

export const logoutUser = (history, user) => dispatch => {
    if(user === null) return
 
    const options = {
        to_do: 'clearSpartanBot',
        userName: user.userName,
        userId: user._id
    }

    const clearStorage = async () => {
        sessionStorage.clear()
        fetch(API_URL + '/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options)
        });
    }

    dispatch({
        type: LOGOUT_SUCCESS,
    });
    dispatch({
        type: ADD_PROVIDER,
        payload: []
    })
    clearStorage();
    return history.push('/');
};

export const coinbaseOAuth = (code) => (dispatch, getState) => {

    console.log(code)

    return axios
        .get(`${API_URL}/auth/coinbase/callback?code=${code}`, tokenConfig(getState))
        .then(res => {
            console.log(res)
            return res
        }
        )
        .catch(err => console.log({err}))

        
    // axios
    //     .get(`${API_URL}/auth/coinbase/callback?code=${code}`, tokenConfig(getState))
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err.response))

}


// Setup config/headers and token
export const tokenConfig = getState => {
    // Get token from global state
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
