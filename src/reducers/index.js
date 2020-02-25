import { combineReducers } from 'redux';

import errorReducer from './errorReducer';
import authReducer from './authReducer';
import successReducer from './successReducer';

export default combineReducers({
    error: errorReducer,
    auth: authReducer,
    success: successReducer,
});
