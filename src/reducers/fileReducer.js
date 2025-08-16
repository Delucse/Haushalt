import {
    FILE_SUCCESS,
    FILE_ERROR,
    FILE_CHANGED,
    FILE_PROGRESS,
    FILE_RESET,
} from '../actions/types';

const initialState = {
    uuid: null,
    umsatz: null,
    wiederkehrenderUmsatz: null,
    kategorien: null,
    umbuchung: null,
    abschluss: null,
    progress: true,
    changed: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FILE_SUCCESS:
            return {
                ...state,
                ...action.payload,
                progress: false,
            };
        case FILE_ERROR:
            return {
                ...state,
                uuid: action.payload,
                progress: false,
            };
        case FILE_CHANGED:
            return {
                ...state,
                changed: action.payload,
                progress: false,
            };
        case FILE_PROGRESS:
            return {
                ...state,
                progress: true,
            };
        case FILE_RESET:
            return {
                ...state,
                uuid: null,
                umsatz: null,
                wiederkehrenderUmsatz: null,
                kategorien: null,
                umbuchung: null,
                abschluss: null,
                progress: true,
                changed: false,
            };
        default:
            return state;
    }
};

export default reducer;
