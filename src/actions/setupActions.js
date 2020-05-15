import { ADD_PROVIDER } from './types';

export const addProvider = (data = []) => {    
    return{
        type: ADD_PROVIDER,
        payload: data
    }
}