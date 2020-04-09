import axios from 'axios';
import { API_URL } from '../../config';
import { tokenConfig } from './authActions';
import {
PROFILE_CREATE_NEW,
PROFILE_CREATE_EDIT,
PROFILE_CREATE_DELETE,
} from "./types"

export const newProfile = (body) => async (dispatch, getState) => {
    try {
        console.log('body', body)
        const res = await axios.post(`${API_URL}/profile/new`, body, tokenConfig(getState))
        console.log(res);

        dispatch({
            type: PROFILE_CREATE_NEW,
            payload: res
        })
    } catch (error) {
        console.log(error.response)
    }
}
