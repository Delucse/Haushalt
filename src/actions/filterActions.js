import moment from 'moment';
import {
    DATAFRAME_FILTER,
    FILTER,
    FILTER_PREV_ART,
    FILTER_PREV_CATEGORIES,
    FILTER_PREV_CATEGORY_TYPE,
    FILTER_PREV_TIME_RANGE,
    FILTER_PREV_TYPE,
    FILTER_PREV_TIME_INTERVAL,
    FILTER_PREV_RESET,
    FILTER_PREV_WORD,
    FILTER_PREV_TAGS,
} from './types';

export const filterDataframe = () => (dispatch, getState) => {
    const { dataframe, filter } = getState();
    const { word, tags, kategorien, kategorieTyp, art, typ, time } = filter;
    var { range } = time;
    var umsatzDfFiltered = dataframe.original.umsatz.slice();
    var umbuchungDfFiltered = dataframe.original.umbuchung.slice();
    var abschlussDfFiltered = dataframe.original.abschluss.slice();
    if (range.length === 0) {
        umsatzDfFiltered = umsatzDfFiltered.filter((row) => row.get('ID') <= 0);
    } else {
        if (range && range.length === 2) {
            umsatzDfFiltered = umsatzDfFiltered.filter(
                (row) =>
                    row.get('Zeitstempel') >= range[0] &&
                    row.get('Zeitstempel') <= range[1],
            );
            umbuchungDfFiltered = umbuchungDfFiltered.filter(
                (row) =>
                    row.get('Zeitstempel') >= range[0] &&
                    row.get('Zeitstempel') <= range[1],
            );
            var prevMonthTimestamp = moment(range[0]).add(-1, 'month');
            var prevAbschlussDfFiltered = abschlussDfFiltered.filter(
                (row) =>
                    row.get('Zeitstempel') >= prevMonthTimestamp &&
                    row.get('Zeitstempel') < range[0],
            );
            abschlussDfFiltered = abschlussDfFiltered.filter(
                (row) =>
                    row.get('Zeitstempel') >= range[0] &&
                    row.get('Zeitstempel') <= range[1],
            );
            if (prevAbschlussDfFiltered.toArray().length > 0) {
                const maxTimestamp =
                    prevAbschlussDfFiltered.stat.max('Zeitstempel');
                abschlussDfFiltered = abschlussDfFiltered.push(
                    prevAbschlussDfFiltered
                        .find((row) => row.get('Zeitstempel') === maxTimestamp)
                        .toArray(),
                );
            }
        }
        if (word && word.length > 0) {
            const lowerWord = word.toLowerCase();
            umsatzDfFiltered = umsatzDfFiltered.filter(
                (row) =>
                    row.get('Datum').includes(lowerWord) ||
                    row
                        .get('Betrag')
                        .toLocaleString('de-DE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })
                        .replace('-', '- ')
                        .includes(lowerWord) ||
                    row.get('Art').toLowerCase().includes(lowerWord) ||
                    row.get('Kategorie').toLowerCase().includes(lowerWord) ||
                    row.get('Typ').toLowerCase().includes(lowerWord) ||
                    row.get('Beschreibung').toLowerCase().includes(lowerWord) ||
                    row.get('Bemerkung').toLowerCase().includes(lowerWord) ||
                    row
                        .get('Tags')
                        .some((tag) => tag.toLowerCase().includes(lowerWord)),
            );
        }
        if (tags && tags.length > 0) {
            umsatzDfFiltered = umsatzDfFiltered.filter((row) =>
                row.get('Tags').some((tag) => tags.includes(tag)),
            );
        }
        if (art && art.length > 0) {
            umsatzDfFiltered = umsatzDfFiltered.filter((row) =>
                art.includes(row.get('Art')),
            );
        }
        if (typ && typ.length > 0) {
            umsatzDfFiltered = umsatzDfFiltered.filter((row) =>
                typ.includes(row.get('Typ')),
            );
        }
        if (kategorien && kategorien.length > 0) {
            umsatzDfFiltered = umsatzDfFiltered.filter((row) =>
                kategorien.includes(row.get(kategorieTyp)),
            );
        }
    }

    dispatch({
        type: DATAFRAME_FILTER,
        payload: {
            umsatz: umsatzDfFiltered,
            umbuchung: umbuchungDfFiltered,
            abschluss: abschlussDfFiltered,
        },
    });
};

export const setFilter =
    (update = true) =>
    (dispatch) => {
        dispatch({ type: FILTER });
        update && dispatch(filterDataframe());
    };

export const setPrevFilterWord = (word) => (dispatch) => {
    dispatch({ type: FILTER_PREV_WORD, payload: word });
};

export const setPrevFilterTags = (tags) => (dispatch) => {
    dispatch({ type: FILTER_PREV_TAGS, payload: tags });
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
