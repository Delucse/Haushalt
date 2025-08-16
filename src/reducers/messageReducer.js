import moment from 'moment';
import {
    ERROR_MESSAGE,
    SUCCESS_MESSAGE,
    RESET_MESSAGE,
} from '../actions/types';

const initialState = {
    message: null,
    error: null,
    type: null,
    art: null,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case RESET_MESSAGE:
            return {
                message: null,
                error: null,
                type: null,
                art: null,
            };
        case ERROR_MESSAGE:
            if (action.payload.type) {
                action.payload.type += `|${moment().valueOf()}`;
            } else {
                action.payload.type = moment().valueOf();
            }
            return {
                error: true,
                ...action.payload,
            };
        case SUCCESS_MESSAGE:
            if (action.payload.type) {
                action.payload.type += `|${moment().valueOf()}`;
            } else {
                action.payload.type = moment().valueOf();
            }
            return {
                error: false,
                ...action.payload,
            };
        default:
            return state;
    }
};

export default reducer;
