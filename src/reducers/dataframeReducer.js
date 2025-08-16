import {
    DATAFRAME_INIT,
    DATAFRAME_INIT_PROGRESS,
    DATAFRAME_FILTER,
    DATAFRAME_ORIGINAL_UMSATZ,
    DATAFRAME_ORIGINAL_UMBUCHUNG,
    DATAFRAME_ORIGINAL_ABSCHLUSS,
    DATAFRAME_ORIGINAL_KATEGORIEN,
    DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
    DATAFRAME_RESET,
} from '../actions/types';

const initialState = {
    original: {
        umsatz: null,
        wiederkehrenderUmsatz: null,
        kategorien: null,
        umbuchung: null,
        abschluss: null,
    },
    filtered: {
        umsatz: null,
        umbuchung: null,
        abschluss: null,
    },
    progress: null,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DATAFRAME_INIT:
            return {
                ...state,
                ...action.payload,
            };
        case DATAFRAME_INIT_PROGRESS:
            return {
                ...state,
                progress: action.payload,
            };
        case DATAFRAME_FILTER:
            return {
                ...state,
                filtered: action.payload,
            };
        case DATAFRAME_ORIGINAL_UMSATZ:
            return {
                ...state,
                original: {
                    ...state.original,
                    umsatz: action.payload,
                },
            };
        case DATAFRAME_ORIGINAL_UMBUCHUNG:
            return {
                ...state,
                original: {
                    ...state.original,
                    umbuchung: action.payload,
                },
            };
        case DATAFRAME_ORIGINAL_ABSCHLUSS:
            return {
                ...state,
                original: {
                    ...state.original,
                    abschluss: action.payload,
                },
            };
        case DATAFRAME_ORIGINAL_KATEGORIEN:
            return {
                ...state,
                original: {
                    ...state.original,
                    kategorien: action.payload,
                },
            };
        case DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ:
            return {
                ...state,
                original: {
                    ...state.original,
                    wiederkehrenderUmsatz: action.payload,
                },
            };
        case DATAFRAME_RESET:
            return {
                ...state,
                original: {
                    umsatz: null,
                    wiederkehrenderUmsatz: null,
                    kategorien: null,
                    umbuchung: null,
                    abschluss: null,
                },
                filtered: {
                    umsatz: null,
                    umbuchung: null,
                    abschluss: null,
                },
                progress: null,
            };
        default:
            return state;
    }
};

export default reducer;
