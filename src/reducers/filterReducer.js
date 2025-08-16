import {
    FILTER_CATEGORIES,
    FILTER_CATEGORY_TYPE,
    FILTER_TYPE,
    FILTER_ART,
    FILTER_TIME_RANGE,
    FILTER_TIME_LABELS,
    FILTER_TIME_INTERVAL,
    FILTER_RESET,
} from '../actions/types';

const initialState = {
    kategorien: [],
    kategorieTyp: 'Oberkategorie',
    art: [],
    typ: [],
    time: {
        range: [],
        interval: 'Monat',
        labels: [],
    },
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FILTER_CATEGORIES:
            return {
                ...state,
                kategorien: action.payload,
            };
        case FILTER_ART:
            return {
                ...state,
                art: action.payload,
            };
        case FILTER_TYPE:
            return {
                ...state,
                typ: action.payload,
            };
        case FILTER_CATEGORY_TYPE:
            return {
                ...state,
                kategorieTyp: action.payload,
            };
        case FILTER_TIME_RANGE:
            return {
                ...state,
                time: { ...state.time, range: action.payload },
            };
        case FILTER_TIME_INTERVAL:
            return {
                ...state,
                time: { ...state.time, interval: action.payload },
            };
        case FILTER_TIME_LABELS:
            return {
                ...state,
                time: { ...state.time, labels: action.payload },
            };
        case FILTER_RESET:
            return {
                ...state,
                kategorien: [],
                kategorieTyp: 'Oberkategorie',
                art: [],
                typ: [],
                time: {
                    range: [],
                    interval: 'Monat',
                    labels: [],
                },
            };
        default:
            return state;
    }
};

export default reducer;
