import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from '../fileActions';
import { filterDataframe } from '../filterActions';
import { snackbarMessage } from '../messageActions';
import { addMonatsposten } from './wiederkehrenderUmsatz';

import { DATAFRAME_ORIGINAL_UMSATZ } from '../types';

export const initUmsatz = async (file, abschluss, umbuchung, kategorien) => {
    var umsatz = await DataFrame.fromText(file, ';');
    umsatz = umsatz.filter(
        (row) =>
            row.get('Datum') !== undefined &&
            row.get('Betrag') !== undefined &&
            row.get('Art') !== undefined &&
            row.get('Typ') !== undefined &&
            row.get('Kategorie') !== undefined &&
            row.get('Beschreibung') !== undefined &&
            row.get('Bemerkung') !== undefined,
    );
    umsatz = umsatz.rename('Kategorie', 'KategorieID');
    umsatz = umsatz.withColumn('Zeitstempel', (row) =>
        moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
    );
    umsatz = umsatz.withColumn('Umsatz', (row) => {
        if (row.get('Art') === 'Einnahme') {
            return row.get('Betrag');
        } else {
            return row.get('Betrag') * -1;
        }
    });
    umsatz = calcNichtGelistet(umsatz, abschluss, umbuchung);
    umsatz = umsatz.join(kategorien, 'KategorieID', 'left');
    umsatz = setUmsatzOhneKategorie(umsatz);
    umsatz = umsatz.withColumn(
        'Monat',
        (row) => moment(row.get('Zeitstempel')).month() + 1,
    );
    umsatz = umsatz.withColumn('Quartal', (row) =>
        moment(row.get('Zeitstempel')).quarter(),
    );
    umsatz = umsatz.withColumn('Jahr', (row) =>
        moment(row.get('Zeitstempel')).year(),
    );
    umsatz = umsatz.withColumn('ID', (row, index) => index + 1);
    umsatz = umsatz.restructure([
        'ID',
        'Datum',
        'Zeitstempel',
        'Monat',
        'Quartal',
        'Jahr',
        'Betrag',
        'Art',
        'Umsatz',
        'Typ',
        'KategorieID',
        'Kategorie',
        'Oberkategorie',
        'Unterkategorie',
        'Beschreibung',
        'Bemerkung',
    ]);
    return umsatz;
};

const setUmsatzOhneKategorie = (umsatz) => {
    if (umsatz.countValue(undefined, 'Kategorie') > 0) {
        var umsatzOhneKategorie = umsatz.chain(
            (row) => row.get('Kategorie') === undefined,
            (row) => row.set('KategorieID', '2'),
            (row) => row.set('Kategorie', 'nicht zugeordnet'),
            (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
            (row) => row.set('Unterkategorie', ''),
            (row) => row.set('Typ', 'variabel'),
        );
        umsatz = umsatz
            .filter((row) => row.get('Kategorie') !== undefined)
            .union(umsatzOhneKategorie);
    }
    return umsatz;
};

const calcNichtGelistet = (umsatz, abschluss, umbuchung) => {
    if (umsatz.count() > 0) {
        var startDate = umsatz.stat.min('Zeitstempel');
        var endDate = umsatz.stat.max('Zeitstempel');
        umsatz = umsatz.restructure([
            'Datum',
            'Zeitstempel',
            'Betrag',
            'Art',
            'Umsatz',
            'Typ',
            'KategorieID',
            'Beschreibung',
            'Bemerkung',
        ]);
        while (startDate <= endDate) {
            const { datum, betrag } = nichtGelistet(
                startDate,
                abschluss,
                umbuchung,
                umsatz,
            );
            umsatz = umsatz.push([
                datum.format('DD.MM.YYYY'),
                datum.valueOf(),
                betrag,
                'Ausgabe',
                betrag * -1,
                'variabel',
                '1',
                '',
                '',
            ]);
            startDate = moment(startDate).startOf('month').add(1, 'month');
        }
    }
    return umsatz;
};

export const addUmsatz =
    (timestamp, betrag, art, typ, kategorie, beschreibung, bemerkung) =>
    (dispatch, getState) => {
        var { umsatz, kategorien } = getState().dataframe.original;
        kategorie = kategorien.find(
            (row) => row.get('KategorieID') === `${kategorie}`,
        );
        var date = moment(timestamp);
        umsatz = umsatz.push([
            umsatz.count() + 1,
            date.format('DD.MM.YYYY'),
            timestamp,
            date.month() + 1,
            date.quarter(),
            date.year(),
            betrag,
            art,
            art !== 'Einnahme' ? betrag * -1 : betrag,
            typ,
            kategorie.get('KategorieID'),
            kategorie.get('Kategorie'),
            kategorie.get('Oberkategorie'),
            kategorie.get('Unterkategorie'),
            beschreibung,
            bemerkung,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });
        dispatch(uploadFile('Umsatz'));
        dispatch(updateNichtGelistet(timestamp, true));
        dispatch(filterDataframe());
        dispatch(snackbarMessage(`Die ${art} wurde erfolgreich hinzugefügt.`));
    };

export const changeUmsatz = (id, update, old) => (dispatch, getState) => {
    var { umsatz, kategorien } = getState().dataframe.original;
    var isNewTimestamp = update.timestamp !== old.timestamp;
    var newDate = moment(update.timestamp);
    umsatz = umsatz.setRow(id - 1, (row) => {
        row = row.set('Betrag', update.betrag);
        row = row.set('Art', update.art);
        row = row.set(
            'Umsatz',
            update.art !== 'Einnahme' ? update.betrag * -1 : update.betrag,
        );
        row = row.set('Typ', update.typ);
        row = row.set('KategorieID', update.kategorie);
        row = row.set('Beschreibung', update.beschreibung);
        row = row.set('Bemerkung', update.bemerkung);

        if (update.kategorie !== old.kategorie) {
            var kategorie = kategorien.find(
                (row) => row.get('KategorieID') === `${update.kategorie}`,
            );
            row = row.set('Kategorie', kategorie.get('Kategorie'));
            row = row.set('Oberkategorie', kategorie.get('Oberkategorie'));
            row = row.set('Unterkategorie', kategorie.get('Unterkategorie'));
        }
        if (isNewTimestamp) {
            row = row.set('Datum', newDate.format('DD.MM.YYYY'));
            row = row.set('Zeitstempel', update.timestamp);
            row = row.set('Monat', newDate.month() + 1);
            row = row.set('Quartal', newDate.quarter());
            row = row.set('Jahr', newDate.year());
        }
        return row;
    });

    dispatch({
        type: DATAFRAME_ORIGINAL_UMSATZ,
        payload: umsatz,
    });
    dispatch(uploadFile('Umsatz'));
    var timestamp = isNewTimestamp ? update.timestamp : old.timestamp;
    dispatch(updateNichtGelistet(timestamp));
    dispatch(updateNichtGelistet(newDate.clone().add(1, 'month').valueOf()));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Die ${update.art} wurde erfolgreich geändert.`));
};

export const deleteUmsatz = (id, timestamp) => (dispatch, getState) => {
    var umsatz = getState().dataframe.original.umsatz;
    umsatz = umsatz.filter((row) => row.get('ID') !== id);
    umsatz = umsatz.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_UMSATZ,
        payload: umsatz,
    });
    dispatch(uploadFile('Umsatz'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Der Umsatz-Eintrag wurde erfolgreich entfernt.`));
};

export const nichtGelistet = (timestamp, abschluss, umbuchung, umsatz) => {
    var date = moment(timestamp);
    var letzterMonatsTag = date.clone().endOf('month');
    var monatDateRaw = date.clone().startOf('month');
    var monatDate = monatDateRaw.valueOf();
    var naechsterMonatDate = monatDateRaw.clone().add(1, 'month').valueOf();
    var vormonatDate = monatDateRaw.clone().add(-1, 'month').valueOf();
    var abschlussMonat = abschluss
        .slice()
        .filter(
            (row) =>
                row.get('Zeitstempel') >= monatDate &&
                row.get('Zeitstempel') < naechsterMonatDate,
        )
        .sortBy('Zeitstempel', true)
        .toCollection();
    var abschlussVormonat = abschluss
        .slice()
        .filter(
            (row) =>
                row.get('Zeitstempel') >= vormonatDate &&
                row.get('Zeitstempel') < monatDate,
        )
        .sortBy('Zeitstempel', true)
        .toCollection();
    var geldbestandVormonat =
        abschlussVormonat.length > 0
            ? Math.round(
                  (abschlussVormonat[0].Konto + abschlussVormonat[0].Bargeld) *
                      100,
              ) / 100
            : 0;

    var betrag = 0;
    if (geldbestandVormonat !== 0 && abschlussMonat.length > 0) {
        var geldbestand =
            abschlussMonat.length > 0
                ? Math.round(
                      (abschlussMonat[0].Konto +
                          abschlussMonat[0].Bargeld +
                          abschlussMonat[0].Monatsposten) *
                          100,
                  ) / 100
                : 0;
        var umbuchungSum =
            Math.round(
                umbuchung
                    .slice()
                    .filter(
                        (row) =>
                            row.get('Zeitstempel') >= monatDate &&
                            row.get('Zeitstempel') < naechsterMonatDate,
                    )
                    .stat.sum('Betrag') * 100,
            ) / 100;
        var dokumentierterUmsatz =
            Math.round(
                umsatz
                    .slice()
                    .filter(
                        (row) =>
                            row.get('Zeitstempel') >= monatDate &&
                            row.get('Zeitstempel') < naechsterMonatDate,
                    )
                    .stat.sum('Umsatz') * 100,
            ) / 100;
        betrag =
            Math.round(
                (geldbestandVormonat +
                    dokumentierterUmsatz -
                    (geldbestand + umbuchungSum)) *
                    100,
            ) / 100;
    }
    return { betrag: betrag, datum: letzterMonatsTag };
};

export const updateNichtGelistet =
    (timestamp, add = false) =>
    (dispatch, getState) => {
        var { abschluss, umbuchung, umsatz } = getState().dataframe.original;
        var date = moment(timestamp);
        var letzterMonatsTag = date.clone().endOf('month'); //new Date(jahr, monat + 1, 0);
        var row = umsatz.find(
            (r) =>
                r.get('KategorieID') === '1' &&
                r.get('Zeitstempel') === letzterMonatsTag.valueOf(),
        );
        if (row) {
            const { betrag } = nichtGelistet(
                timestamp,
                abschluss,
                umbuchung,
                umsatz.filter((r) => r.get('KategorieID') !== '1'),
            );
            umsatz = umsatz.setRow(row.get('ID') - 1, (r) => {
                r = r.set('Betrag', betrag);
                r = r.set('Umsatz', betrag * -1);
                return r;
            });

            dispatch({
                type: DATAFRAME_ORIGINAL_UMSATZ,
                payload: umsatz,
            });
        } else if (add) {
            const { betrag } = nichtGelistet(
                timestamp,
                abschluss,
                umbuchung,
                umsatz.filter((row) => row.get('KategorieID') !== '1'),
            );
            umsatz = umsatz.push([
                umsatz.count() + 1,
                letzterMonatsTag.format('DD.MM.YYYY'),
                letzterMonatsTag.valueOf(),
                letzterMonatsTag.month() + 1,
                letzterMonatsTag.quarter(),
                letzterMonatsTag.year(),
                betrag,
                'Ausgabe',
                betrag * -1,
                'variabel',
                '1',
                'nicht gelistet',
                'nicht gelistet',
                'nicht gelistet',
                '',
                '',
            ]);
            dispatch({
                type: DATAFRAME_ORIGINAL_UMSATZ,
                payload: umsatz,
            });
            dispatch(
                addMonatsposten(
                    letzterMonatsTag.year(),
                    letzterMonatsTag.month() + 1,
                ),
            );
        }
    };
