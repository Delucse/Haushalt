import moment from 'moment';
import { filterDataframe } from './datafraneActions';
import {
    FILTER_ART,
    FILTER_CATEGORIES,
    FILTER_CATEGORY_TYPE,
    FILTER_TIME_RANGE,
    FILTER_TYPE,
    FILTER_TIME_INTERVAL,
} from './types';

export const setFilterCategoryType = (type) => (dispatch) => {
    dispatch({ type: FILTER_CATEGORY_TYPE, payload: type });
    dispatch(setFilterCategories([]));
};

export const setFilterCategories =
    (categories, update = true) =>
    (dispatch) => {
        dispatch({ type: FILTER_CATEGORIES, payload: categories });
        update && dispatch(filterDataframe());
    };

export const setFilterArts =
    (arts, update = true) =>
    (dispatch) => {
        dispatch({ type: FILTER_ART, payload: arts });
        update && dispatch(filterDataframe());
    };

export const setFilterTypes =
    (types, update = true) =>
    (dispatch) => {
        dispatch({ type: FILTER_TYPE, payload: types });
        update && dispatch(filterDataframe());
    };

export const setFilterTimeInterval = (interval) => (dispatch, getState) => {
    var range = getState().filter.time.range;
    dispatch({
        type: FILTER_TIME_INTERVAL,
        payload: interval,
    });
    var startDate = moment(range[0]);
    var endDate = moment(range[1]);
    switch (interval) {
        case 'Quartal':
            range = [
                startDate.startOf('quarter').valueOf(),
                endDate.endOf('quarter').valueOf(),
            ];
            break;
        case 'Jahr':
            range = [startDate.startOf('year'), endDate.endOf('year')];
            break;
        default:
            break;
    }
    dispatch(setFilterTimeRange(range));
};

export const setFilterTimeRange =
    (range, update = true) =>
    (dispatch, getState) => {
        if (range[0] > range[1]) {
            const interval = getState().filter.time.interval;
            range[1] = moment(range[0])
                .endOf(
                    interval === 'Monat'
                        ? 'month'
                        : interval === 'Quartal'
                          ? 'quarter'
                          : 'year',
                )
                .valueOf();
        }
        dispatch({
            type: FILTER_TIME_RANGE,
            payload: range,
        });
        update && dispatch(filterDataframe());
    };
