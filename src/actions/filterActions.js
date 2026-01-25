import moment from 'moment';
import { filterDataframe } from './datafraneActions';
import {
    FILTER,
    FILTER_PREV_ART,
    FILTER_PREV_CATEGORIES,
    FILTER_PREV_CATEGORY_TYPE,
    FILTER_PREV_TIME_RANGE,
    FILTER_PREV_TYPE,
    FILTER_PREV_TIME_INTERVAL,
    FILTER_PREV_RESET,
    FILTER_PREV_WORD,
} from './types';

export const setFilter =
    (update = true) =>
    (dispatch) => {
        dispatch({ type: FILTER });
        update && dispatch(filterDataframe());
    };

export const setPrevFilterWord = (word) => (dispatch) => {
    dispatch({ type: FILTER_PREV_WORD, payload: word });
};

export const setPrevFilterCategoryType = (type) => (dispatch) => {
    dispatch({ type: FILTER_PREV_CATEGORY_TYPE, payload: type });
    dispatch(setPrevFilterCategories([]));
};

export const setPrevFilterCategories = (categories) => (dispatch) => {
    dispatch({ type: FILTER_PREV_CATEGORIES, payload: categories });
};

export const setPrevFilterArts = (arts) => (dispatch) => {
    dispatch({ type: FILTER_PREV_ART, payload: arts });
};

export const setPrevFilterTypes = (types) => (dispatch) => {
    dispatch({ type: FILTER_PREV_TYPE, payload: types });
};

export const setPrevFilterTimeInterval = (interval) => (dispatch, getState) => {
    const state = getState();
    var range = state.filter.prev?.time?.range || state.filter.time.range;
    dispatch({
        type: FILTER_PREV_TIME_INTERVAL,
        payload: interval,
    });
    var startDate = moment(range[0]);
    var endDate = moment(range[1]);
    const momentInterval =
        interval === 'Monat'
            ? 'month'
            : interval === 'Quartal'
              ? 'quarter'
              : 'year';

    range = [
        startDate.startOf(momentInterval).valueOf(),
        endDate.endOf(momentInterval).valueOf(),
    ];
    dispatch(setPrevFilterTimeRange(range));
};

export const setPrevFilterTimeRange = (range) => (dispatch) => {
    dispatch({
        type: FILTER_PREV_TIME_RANGE,
        payload: range,
    });
};

export const setResetPrevFilter = () => (dispatch) => {
    dispatch({ type: FILTER_PREV_RESET });
};
