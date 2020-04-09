import {
    PROFILE_CREATE_NEW,
    PROFILE_CREATE_EDIT,
    PROFILE_CREATE_DELETE,
    } from "../actions/types"
    
    const initState = {
        profiles: null,
    };

    const profilesReducer = (state = initState, action) => {
        switch(action.type){
            case PROFILE_CREATE_NEW:
                return {
                    ...state,
                    profiles: action.payload,
                }
            default: 
                return state;

        }
    }

export default profilesReducer;