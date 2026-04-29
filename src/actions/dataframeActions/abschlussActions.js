import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from '../fileActions';
import { filterDataframe } from '../filterActions';
import { snackbarMessage } from '../messageActions';
import { updateNichtGelistet } from './umsatzActions';

import { DATAFRAME_ORIGINAL_ABSCHLUSS } from '../types';

export const initAbschluss = async (file, umsatz) => {
    var abschluss = await DataFrame.fromText(file, ';');
    abschluss = abschluss.filter(
        (row) =>
            row.get('Datum') !== undefined &&
            row.get('Konto') !== undefined &&
            row.get('Bargeld') !== undefined,
    );
    abschluss = abschluss.cast('Konto', (val) => Number(val));
    abschluss = abschluss.cast('Bargeld', (val) => Number(val));
    abschluss = abschluss.withColumn('Zeitstempel', (row) =>
        moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
    );
    if (abschluss.count() > 0) {
        abschluss = calcMonatsposten(abschluss, umsatz);
    } else {
        abschluss = abschluss.withColumn('Monatsposten', (row) => 0);
    }
    abschluss = abschluss.withColumn('ID', (row, index) => index + 1);
    abschluss = abschluss.restructure([
        'ID',
        'Datum',
        'Zeitstempel',
        'Konto',
        'Bargeld',
        'Monatsposten',
    ]);
    return abschluss;
};

export const addAbschluss =
    (timestamp, konto, bargeld) => (dispatch, getState) => {
        var { abschluss, umsatz } = getState().dataframe.original;
        var newDate = moment(timestamp);
        abschluss = abschluss.push([
            abschluss.count() + 1,
            newDate.format('DD.MM.YYYY'),
            timestamp,
            konto,
            bargeld,
            0,
        ]);
        abschluss = calcMonatsposten(abschluss, umsatz);
        dispatch({
            type: DATAFRAME_ORIGINAL_ABSCHLUSS,
            payload: abschluss,
        });
        dispatch(uploadFile('Abschluss'));
        dispatch(updateNichtGelistet(timestamp, true));
        dispatch(
            updateNichtGelistet(newDate.clone().add(1, 'month').valueOf()),
        );
        dispatch(filterDataframe());
        dispatch(
            snackbarMessage(`Der Abschluss wurde erfolgreich hinzugefügt.`),
        );
    };

export const changeAbschluss = (id, update, old) => (dispatch, getState) => {
    var { abschluss, umsatz } = getState().dataframe.original;
    var newDate = moment(update.timestamp);
    abschluss = abschluss.setRow(id - 1, (row) => {
        row = row.set('Datum', newDate.format('DD.MM.YYYY'));
        row = row.set('Zeitstempel', update.timestamp);
        row = row.set('Konto', update.konto);
        row = row.set('Bargeld', update.bargeld);
        return row;
    });
    var isNewTimestamp = update.timestamp !== old.timestamp;
    if (isNewTimestamp) {
        abschluss = calcMonatsposten(abschluss, umsatz);
    }
    dispatch({
        type: DATAFRAME_ORIGINAL_ABSCHLUSS,
        payload: abschluss,
    });
    dispatch(uploadFile('Abschluss'));
    var timestamp = isNewTimestamp ? update.timestamp : old.timestamp;
    dispatch(updateNichtGelistet(timestamp));
    dispatch(updateNichtGelistet(newDate.clone().add(1, 'month').valueOf()));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Der Abschluss wurde erfolgreich geändert.`));
};

export const deleteAbschluss = (id, timestamp) => (dispatch, getState) => {
    var { abschluss, umsatz } = getState().dataframe.original;
    abschluss = abschluss.filter((row) => row.get('ID') !== id);
    abschluss = abschluss.withColumn('ID', (row, index) => index + 1);
    abschluss = calcMonatsposten(abschluss, umsatz);
    dispatch({
        type: DATAFRAME_ORIGINAL_ABSCHLUSS,
        payload: abschluss,
    });
    dispatch(uploadFile('Abschluss'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(updateNichtGelistet(moment(timestamp).add(1, 'month').valueOf()));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Der Abschluss wurde erfolgreich entfernt.`));
};

export const calcMonatsposten = (abschluss, umsatz) => {
    if (abschluss.count() > 0) {
        var maxAbschluss = abschluss.stat.max('Zeitstempel');
        abschluss = abschluss.withColumn('Monatsposten', (row) => {
            if (row.get('Zeitstempel') === maxAbschluss) {
                return umsatz
                    .filter(
                        (row) =>
                            row.get('WID') &&
                            row.get('Zeitstempel') > maxAbschluss,
                    )
                    .stat.sum('Umsatz');
            }
            return 0;
        });
    }
    return abschluss;
};
