import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from '../fileActions';
import { filterDataframe } from '../filterActions';
import { snackbarMessage } from '../messageActions';
import {
    updateNichtGelistet,
    updateNichtGelistetMonate,
} from './umsatzActions';

import { DATAFRAME_ORIGINAL_UMBUCHUNG } from '../types';

export const initUmbuchung = async (file) => {
    var umbuchung = await DataFrame.fromText(file, ';');
    umbuchung = umbuchung.filter(
        (row) =>
            row.get('Datum') !== undefined &&
            row.get('Betrag') !== undefined &&
            row.get('Bemerkung') !== undefined,
    );
    umbuchung = umbuchung.cast('Betrag', (val) => Number(val));
    umbuchung = umbuchung.withColumn('Zeitstempel', (row) =>
        moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
    );
    umbuchung = umbuchung.withColumn('ID', (row, index) => index + 1);
    return umbuchung;
};

export const addUmbuchung =
    (timestamp, betrag, bemerkung) => (dispatch, getState) => {
        var umbuchung = getState().dataframe.original.umbuchung;
        umbuchung = umbuchung.push([
            moment(timestamp).format('DD.MM.YYYY'),
            betrag,
            bemerkung,
            timestamp,
            umbuchung.count() + 1,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_UMBUCHUNG,
            payload: umbuchung,
        });
        dispatch(uploadFile('Umbuchung'));
        dispatch(updateNichtGelistet(timestamp, true));
        dispatch(filterDataframe());
        dispatch(
            snackbarMessage(`Die Umbuchung wurde erfolgreich hinzugefügt.`),
        );
    };

export const changeUmbuchung =
    (id, timestamp, betrag, bemerkung) => (dispatch, getState) => {
        var umbuchung = getState().dataframe.original.umbuchung,
            alterZeitstempel = null;
        umbuchung = umbuchung.setRow(id - 1, (row) => {
            // alten Monat merken, er muss ebenfalls neu berechnet werden
            alterZeitstempel = row.get('Zeitstempel');
            row = row.set('Betrag', betrag);
            row = row.set('Bemerkung', bemerkung);
            row = row.set('Datum', moment(timestamp).format('DD.MM.YYYY'));
            row = row.set('Zeitstempel', timestamp);
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_UMBUCHUNG,
            payload: umbuchung,
        });
        dispatch(uploadFile('Umbuchung'));
        dispatch(updateNichtGelistetMonate([alterZeitstempel, timestamp]));
        dispatch(filterDataframe());
        dispatch(snackbarMessage(`Die Umbuchung wurde erfolgreich geändert.`));
    };

export const deleteUmbuchung = (id, timestamp) => (dispatch, getState) => {
    var umbuchung = getState().dataframe.original.umbuchung;
    umbuchung = umbuchung.filter((row) => row.get('ID') !== id);
    // IDs müssen lückenlos Index + 1 bleiben (setRow nutzt ID - 1)
    umbuchung = umbuchung.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_UMBUCHUNG,
        payload: umbuchung,
    });
    dispatch(uploadFile('Umbuchung'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Die Umbuchung wurde erfolgreich entfernt.`));
};
