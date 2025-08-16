import {
    AUTH_TYPE,
    AUTH_SUCCESS,
    AUTH_ERROR,
    AUTH_PROGRESS,
    AUTH_LOGOUT,
} from '../actions/types';

const initialState = {
    type: null,
    token: null,
    progress: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_PROGRESS:
            return {
                ...state,
                progress: action.payload,
            };
        case AUTH_TYPE:
            return {
                ...state,
                type: action.payload,
            };
        case AUTH_SUCCESS:
            return {
                ...state,
                token: action.payload,
                progress: false,
            };
        case AUTH_LOGOUT:
            return {
                ...state,
                type: null,
                token: null,
            };
        case AUTH_ERROR:
            return {
                ...state,
                token: null,
                progress: false,
            };
        default:
            return state;
    }
};

export default reducer;
