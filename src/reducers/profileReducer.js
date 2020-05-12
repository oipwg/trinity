import {
    PROFILE_CREATE_NEW,
    PROFILE_CREATE_UPDATE,
    PROFILE_CREATE_EDIT,
    PROFILE_DELETE,
    PROFILE_OBJECT,
    PROFILE_GET,
    LOGIN_SUCCESS,
    USER_LOADING,
    LOGOUT_SUCCESS,
    
    } from "../actions/types"
     
    const initState = {
        profileList: null,
    };

    const profilesReducer = (state = initState, action) => {
        switch(action.type){
            case PROFILE_CREATE_NEW:
            case PROFILE_CREATE_UPDATE:
                console.log('PROFILE_CREATE_UPDATE')
            case PROFILE_DELETE:
                return {
                    ...state,
                    profileList: action.payload,
                }
            case PROFILE_GET:
                return {
                    ...state,
                    profileList: action.payload
                }
            case LOGOUT_SUCCESS:
                return {
                    ...state,
                    profileList: null,
                }
            default: 
                return state;

        }
    }

export default profilesReducer;