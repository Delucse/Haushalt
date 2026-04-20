import {
    FILTER,
    FILTER_COUNT,
    FILTER_PREV_WORD,
    FILTER_PREV_TAGS,
    FILTER_PREV_CATEGORIES,
    FILTER_PREV_CATEGORY_TYPE,
    FILTER_PREV_TYPE,
    FILTER_PREV_ART,
    FILTER_PREV_TIME_RANGE,
    FILTER_PREV_TIME_INTERVAL,
    FILTER_PREV_RESET,
    FILTER_PARTIAL_RESET,
    FILTER_RESET,
} from '../actions/types';

const initialState = {
    kategorien: [],
    kategorieTyp: 'Oberkategorie',
    art: [],
    typ: [],
    word: '',
    tags: [],
    time: {
        range: [],
        interval: 'Monat',
    },
    count: 0,
    prev: {},
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FILTER:
            return {
                ...state,
                ...state.prev,
                prev: {},
            };
        case FILTER_COUNT:
            return {
                ...state,
                count:
                    state.kategorien.length +
                    state.art.length +
                    state.typ.length +
                    state.tags.length +
                    (state.word.length > 0 ? 1 : 0),
            };
        case FILTER_PREV_WORD:
            return {
                ...state,
                prev: { ...state.prev, word: action.payload },
            };
        case FILTER_PREV_TAGS:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    tags: action.payload,
                },
            };
        case FILTER_PREV_CATEGORIES:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    kategorien: action.payload,
                },
            };
        case FILTER_PREV_ART:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    art: action.payload,
                },
            };
        case FILTER_PREV_TYPE:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    typ: action.payload,
                },
            };
        case FILTER_PREV_CATEGORY_TYPE:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    kategorieTyp: action.payload,
                },
            };
        case FILTER_PREV_TIME_RANGE:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    time: {
                        ...state.time,
                        ...state.prev.time,
                        range: action.payload,
                    },
                },
            };
        case FILTER_PREV_TIME_INTERVAL:
            return {
                ...state,
                prev: {
                    ...state.prev,
                    time: {
                        ...state.time,
                        ...state.prev.time,
                        interval: action.payload,
                    },
                },
            };
        case FILTER_PREV_RESET:
            return {
                ...state,
                prev: {},
            };
        case FILTER_PARTIAL_RESET:
            return {
                ...state,
                kategorien: [],
                art: [],
                typ: [],
                word: '',
                tags: [],
                count: 0,
                prev: {},
            };
        case FILTER_RESET:
            return {
                ...state,
                kategorien: [],
                kategorieTyp: 'Oberkategorie',
                art: [],
                typ: [],
                word: '',
                tags: [],
                time: {
                    range: [],
                    interval: 'Monat',
                },
                count: 0,
                prev: {},
            };
        default:
            return state;
    }
};

export default reducer;
