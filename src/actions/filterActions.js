import moment from 'moment';
import { filterDataframe } from './datafraneActions';
import {
    FILTER_ART,
    FILTER_CATEGORIES,
    FILTER_CATEGORY_TYPE,
    FILTER_TIME_RANGE,
    FILTER_TYPE,
    FILTER_TIME_INTERVAL,
    FILTER_TIME_LABELS,
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

const quarters = ['', 'I', 'II', 'III', 'IV'];

const months = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
];

export const setFilterTimeLabels = () => (dispatch, getState) => {
    const { range, interval } = getState().filter.time;
    var startTimestamp = range[0];
    const endTimestamp = range[1];
    const labels = [];
    switch (interval) {
        case 'Quartal':
            while (startTimestamp < endTimestamp) {
                var startDate = moment(startTimestamp);
                var quarter = quarters[startDate.quarter()];
                var label = `Q ${quarter}`;
                if (quarter === 'I' || startTimestamp === range[0]) {
                    label += ` '${startDate.format('YY')}`;
                }
                labels.push({
                    Label: label,
                    Jahr: startDate.year(),
                    Quartal: quarter,
                });
                startTimestamp = startDate.add(1, 'quarter');
            }
            break;
        case 'Jahr':
            while (startTimestamp < endTimestamp) {
                // eslint-disable-next-line
                var startDate = moment(startTimestamp);
                // eslint-disable-next-line
                var year = startDate.year();
                labels.push({ Label: year, Jahr: year });
                startTimestamp = startDate.add(1, 'year');
            }
            break;
        default:
            while (startTimestamp < endTimestamp) {
                // eslint-disable-next-line
                var startDate = moment(startTimestamp);
                var monthString = months[startDate.month()];
                // eslint-disable-next-line
                var label = monthString;
                if (monthString === 'Jan' || startTimestamp === range[0]) {
                    label += ` '${startDate.format('YY')}`;
                }
                labels.push({
                    Label: label,
                    Jahr: startDate.year(),
                    Monat: monthString,
                });
                startTimestamp = startDate.add(1, 'month');
            }
            break;
    }
    dispatch({
        type: FILTER_TIME_LABELS,
        payload: labels,
    });
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
            range[1] = moment(range[0])
                .endOf(
                    getState().filter.time.interval === 'Monat'
                        ? 'month'
                        : 'year'
                )
                .valueOf();
        }
        dispatch({
            type: FILTER_TIME_RANGE,
            payload: range,
        });
        dispatch(setFilterTimeLabels());
        update && dispatch(filterDataframe());
    };
