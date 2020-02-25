import { GET_SUCCESS, CLEAR_SUCCESS } from './types';

// Return SUCCESS
export const returnSuccess = (msg, status, id = null) => {
    console.log('successAction', msg, status);

    return {
        type: GET_SUCCESS,
        payload: { msg, status, id },
    };
};

// Clear SUCCESS
export const clearSuccess = () => {
    return {
        type: CLEAR_SUCCESS,
    };
};
