import axios from 'axios';
import { API_URL } from '../../config';
import { tokenConfig } from './authActions';
import {
PROFILE_CREATE_NEW,
PROFILE_CREATE_UPDATE,
PROFILE_CREATE_EDIT,
PROFILE_DELETE,
PROFILE_OBJECT,
PROFILE_GET,
USER_LOADING,
} from "./types"

export const newProfile = (body) => async (dispatch, getState) => {
    try {
        const res = await axios.post(`${API_URL}/profile/new`, body, tokenConfig(getState))


        dispatch({
            type: PROFILE_CREATE_NEW,
            payload: res.data.profiles 
        })

        return res


    } catch (error) {
        console.log(error.response)
        return error.response
    }
}

export const getProfile = () => async (dispatch, getState) => {
    try {
        const res = await axios.get(`${API_URL}/profile/get`, tokenConfig(getState))

        dispatch({
            type: PROFILE_GET,
            payload: res.data.profiles
        })

    } catch (error) {
        console.log(error.response)
    }
}

export const updateProfile = (body) => async (dispatch, getState) => {
    try {

        const res = await axios.post(`${API_URL}/profile/update`, body, tokenConfig(getState))

        dispatch({
            type: PROFILE_CREATE_UPDATE,
            payload: res.data.profiles 
        })

        return res


    } catch (error) {
        console.log(error.message)
        return error.message
    }
}

export const deleteProfile = (_id) => async (dispatch, getState) => {
    try {
        const res = await axios.delete(`${API_URL}/profile/delete/${_id}`, tokenConfig(getState))

        dispatch({
            type: PROFILE_DELETE,
            payload: res.data.profiles
        })

        return res;

    } catch (error) {
        console.log(error.response)
    }
}