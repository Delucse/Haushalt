import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from '../fileActions';
import { filterDataframe } from '../filterActions';
import { snackbarMessage } from '../messageActions';
import { updateNichtGelistet } from './umsatzActions';

import { DATAFRAME_ORIGINAL_ABSCHLUSS } from '../types';

export const initAbschluss = async (file, wiederkehrenderUmsatz) => {
    var abschluss = await DataFrame.fromText(file, ';');
    abschluss = abschluss.filter(
        (row) =>
            row.get('Datum') !== undefined &&
            row.get('Konto') !== undefined &&
            row.get('Bargeld') !== undefined,
    );
    if (
        abschluss.count() > 0 &&
        !moment(
            abschluss.toCollection()[0]['Datum'],
            'DD.MM.YYYY',
            true,
        ).isValid()
    ) {
        abschluss = abschluss.cast('Datum', (val) =>
            moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
        );
    }
    abschluss = abschluss.withColumn('Zeitstempel', (row) =>
        moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
    );
    abschluss = abschluss.cast(
        'Konto',
        (val) => val && Number(val.replace(',', '.')),
    );
    abschluss = abschluss.cast(
        'Bargeld',
        (val) => val && Number(val.replace(',', '.')),
    );
    if (abschluss.count() > 0) {
        var maxAbschluss = abschluss.stat.max('Zeitstempel');
        abschluss = abschluss.withColumn('Monatsposten', (row) => {
            if (row.get('Zeitstempel') === maxAbschluss) {
                return wiederkehrenderUmsatz
                    .filter((row) => row.get('Zeitstempel') > maxAbschluss)
                    .stat.sum('Umsatz');
            }
            return 0;
        });
    } else {
        abschluss = abschluss.withColumn('Monatsposten', (row) => 0);
    }
    abschluss = abschluss.withColumn('ID', (row, index) => index + 1);
    return abschluss;
};

export const addAbschluss =
    (timestamp, konto, bargeld) => (dispatch, getState) => {
        var abschluss = getState().dataframe.original.abschluss;
        var newDate = moment(timestamp);
        abschluss = abschluss.push([
            newDate.format('DD.MM.YYYY'),
            konto,
            bargeld,
            timestamp,
            konto + bargeld,
            abschluss.count() + 1,
        ]);
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
    var { abschluss, wiederkehrenderUmsatz } = getState().dataframe.original;
    var newDate = moment(update.timestamp);
    abschluss = abschluss.setRow(id - 1, (row) => {
        row = row.set('Konto', update.konto);
        row = row.set('Bargeld', update.bargeld);
        row = row.set('Datum', newDate.format('DD.MM.YYYY'));
        return row;
    });
    var isNewTimestamp = update.timestamp !== old.timestamp;
    if (isNewTimestamp) {
        var maxAbschluss = abschluss.stat.max('Zeitstempel');
        abschluss = abschluss.withColumn('Monatsposten', () => 0);
        id = abschluss
            .find((row) => row.get('Zeitstempel') === maxAbschluss)
            .get('ID');
        var monatsposten = wiederkehrenderUmsatz
            .filter((row) => row.get('Zeitstempel') > maxAbschluss)
            .stat.sum('Umsatz');
        abschluss = abschluss.setRow(id - 1, (row) =>
            row.set('Monatsposten', monatsposten),
        );
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
    var abschluss = getState().dataframe.original.abschluss;
    abschluss = abschluss.filter((row) => row.get('ID') !== id);
    abschluss = abschluss.withColumn('ID', (row, index) => index + 1);
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
