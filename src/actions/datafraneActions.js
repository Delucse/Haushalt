import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from './fileActions';
import {
    setPrevFilterCategories,
    setPrevFilterTimeRange,
    setFilter,
} from './filterActions';
import { snackbarErrorMessage, snackbarMessage } from './messageActions';

import { getCookieDefaultBoolean } from '../reducers/settingsReducer';

import {
    DATAFRAME_FILTER,
    DATAFRAME_INIT,
    DATAFRAME_ORIGINAL_UMSATZ,
    DATAFRAME_ORIGINAL_UMBUCHUNG,
    DATAFRAME_ORIGINAL_ABSCHLUSS,
    DATAFRAME_ORIGINAL_KATEGORIEN,
    DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
    DATAFRAME_INIT_PROGRESS,
    SETTING_AUTOSAVE_MANUAL,
} from './types';

export const initDataframe = () => async (dispatch, getState) => {
    try {
        const state = getState();
        const type = state.auth.type;
        const file = state.file;

        if (type === 'locale') {
            dispatch({ type: SETTING_AUTOSAVE_MANUAL, payload: false });
        } else {
            const autosave = getCookieDefaultBoolean('autoSave', true);
            dispatch({ type: SETTING_AUTOSAVE_MANUAL, payload: autosave });
        }

        var kategorienDf = await DataFrame.fromText(file.kategorien, ';');
        kategorienDf = kategorienDf.filter(
            (row) =>
                row.get('ID') !== undefined &&
                row.get('Oberkategorie') !== undefined &&
                row.get('Unterkategorie') !== undefined &&
                row.get('Typ') !== undefined,
        );
        kategorienDf = kategorienDf.rename('ID', 'KategorieID');
        kategorienDf = kategorienDf.push(
            ['1', 'nicht gelistet', '', 'variabel'],
            ['2', 'nicht zugeordnet', '', 'variabel'],
        );
        kategorienDf = kategorienDf.withColumn('Kategorie', (row) => {
            var kategorie = row.get('Oberkategorie');
            if (row.get('Unterkategorie')) {
                kategorie += ' | ' + row.get('Unterkategorie');
            }
            return kategorie;
        });
        kategorienDf = kategorienDf.withColumn('Unterkategorie', (row) => {
            const unterkategorie = row.get('Unterkategorie');
            if (unterkategorie !== '') return unterkategorie;
            return row.get('Oberkategorie');
        });

        var wiederkehrenderUmsatzDf = await DataFrame.fromText(
            file.wiederkehrenderUmsatz,
            ';',
        );
        if (!wiederkehrenderUmsatzDf.listColumns().includes('Datum')) {
            wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.withColumn(
                'Datum',
                () => '',
            );
        }
        if (!wiederkehrenderUmsatzDf.listColumns().includes('Kategorie')) {
            wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.rename(
                'KategorieID',
                'Kategorie',
            );
        }
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.filter(
            (row) =>
                row.get('Tag') !== undefined &&
                row.get('Datum') !== undefined &&
                row.get('Betrag') !== undefined &&
                row.get('Art') !== undefined &&
                row.get('Kategorie') !== undefined &&
                row.get('Beschreibung') !== undefined &&
                row.get('Bemerkung') !== undefined,
        );
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.rename(
            'Kategorie',
            'KategorieID',
        );
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.withColumn(
            'Zeitstempel',
            (row) => moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
        );
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.withColumn(
            'Umsatz',
            (row) => {
                if (row.get('Art') === 'Einnahme') {
                    return row.get('Betrag');
                } else {
                    return row.get('Betrag') * -1;
                }
            },
        );
        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.join(
            kategorienDf,
            'KategorieID',
            'left',
        );

        var umbuchungDf = await DataFrame.fromText(file.umbuchung, ';');
        umbuchungDf = umbuchungDf.filter(
            (row) =>
                row.get('Datum') !== undefined &&
                row.get('Betrag') !== undefined &&
                row.get('Bemerkung') !== undefined,
        );
        if (
            umbuchungDf.count() > 0 &&
            !moment(
                umbuchungDf.toCollection()[0]['Datum'],
                'DD.MM.YYYY',
                true,
            ).isValid()
        ) {
            umbuchungDf = umbuchungDf.cast('Datum', (val) =>
                moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
            );
        }
        umbuchungDf = umbuchungDf.withColumn('Zeitstempel', (row) =>
            moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
        );
        umbuchungDf = umbuchungDf.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );

        var abschlussDf = await DataFrame.fromText(file.abschluss, ';');
        abschlussDf = abschlussDf.filter(
            (row) =>
                row.get('Datum') !== undefined &&
                row.get('Konto') !== undefined &&
                row.get('Bargeld') !== undefined,
        );
        if (
            abschlussDf.count() > 0 &&
            !moment(
                abschlussDf.toCollection()[0]['Datum'],
                'DD.MM.YYYY',
                true,
            ).isValid()
        ) {
            abschlussDf = abschlussDf.cast('Datum', (val) =>
                moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
            );
        }
        abschlussDf = abschlussDf.withColumn('Zeitstempel', (row) =>
            moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
        );
        abschlussDf = abschlussDf.cast(
            'Konto',
            (val) => val && Number(val.replace(',', '.')),
        );
        abschlussDf = abschlussDf.cast(
            'Bargeld',
            (val) => val && Number(val.replace(',', '.')),
        );
        if (abschlussDf.count() > 0) {
            var maxAbschluss = abschlussDf.stat.max('Zeitstempel');
            abschlussDf = abschlussDf.withColumn('Monatsposten', (row) => {
                if (row.get('Zeitstempel') === maxAbschluss) {
                    return wiederkehrenderUmsatzDf
                        .filter((row) => row.get('Zeitstempel') > maxAbschluss)
                        .stat.sum('Umsatz');
                }
                return 0;
            });
        } else {
            abschlussDf = abschlussDf.withColumn('Monatsposten', (row) => 0);
        }

        var umsatzDf = await DataFrame.fromText(file.umsatz, ';');
        umsatzDf = umsatzDf.filter(
            (row) =>
                row.get('Datum') !== undefined &&
                row.get('Betrag') !== undefined &&
                row.get('Art') !== undefined &&
                row.get('Kategorie') !== undefined &&
                row.get('Beschreibung') !== undefined &&
                row.get('Bemerkung') !== undefined,
        );
        umsatzDf = umsatzDf.rename('Kategorie', 'KategorieID');
        if (
            umsatzDf.count() > 0 &&
            !moment(
                umsatzDf.toCollection()[0]['Datum'],
                'DD.MM.YYYY',
                true,
            ).isValid()
        ) {
            umsatzDf = umsatzDf.cast('Datum', (val) =>
                moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
            );
        }
        umsatzDf = umsatzDf.withColumn('Zeitstempel', (row) =>
            moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
        );
        umsatzDf = umsatzDf.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );
        umsatzDf = umsatzDf.withColumn('Umsatz', (row) => {
            if (row.get('Art') === 'Einnahme') {
                return row.get('Betrag');
            } else {
                return row.get('Betrag') * -1;
            }
        });

        if (umsatzDf.count() > 0) {
            var startDate = umsatzDf.stat.min('Zeitstempel');
            var endDate = umsatzDf.stat.max('Zeitstempel');
            console.log(
                moment(startDate).format('DD.MM.YYYY'),
                moment(endDate).format('DD.MM.YYYY'),
            );

            while (startDate <= endDate) {
                const { datum, betrag } = nichtGelistet(
                    startDate,
                    abschlussDf,
                    umbuchungDf,
                    umsatzDf,
                );
                console.log(datum.format('DD.MM.YYYY'), betrag);
                umsatzDf = umsatzDf.push([
                    datum.format('DD.MM.YYYY'),
                    betrag,
                    'Ausgabe',
                    '1',
                    '',
                    '',
                    datum.valueOf(),
                    betrag * -1,
                ]);
                startDate = moment(startDate).startOf('month').add(1, 'month');
            }
        }
        umsatzDf = umsatzDf.join(kategorienDf, 'KategorieID', 'left');
        if (umsatzDf.countValue(undefined, 'Kategorie') > 0) {
            var umsatzNoKategorieDf = umsatzDf.chain(
                (row) => row.get('Kategorie') === undefined,
                (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
                (row) => row.set('Unterkategorie', ''),
                (row) => row.set('Kategorie', 'nicht zugeordnet'),
                (row) => row.set('Typ', 'variabel'),
                (row) => row.set('KategorieID', '2'),
            );
            umsatzDf = umsatzDf
                .filter((row) => row.get('Kategorie') !== undefined)
                .union(umsatzNoKategorieDf);
        }

        umsatzDf = umsatzDf.withColumn(
            'Monat',
            (row) => moment(row.get('Zeitstempel')).month() + 1,
        );
        umsatzDf = umsatzDf.withColumn('Quartal', (row) =>
            moment(row.get('Zeitstempel')).quarter(),
        );
        umsatzDf = umsatzDf.withColumn('Jahr', (row) =>
            moment(row.get('Zeitstempel')).year(),
        );

        kategorienDf = kategorienDf.withColumn('ID', (row, index) => index + 1);

        wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.withColumn(
            'ID',
            (row, index) => index + 1,
        );

        // umsatzDf = umsatzDf.sortBy(['Zeitstempel']);
        umsatzDf = umsatzDf.withColumn('ID', (row, index) => index + 1);
        var umsatzDfFiltered = umsatzDf.slice();
        console.log(umsatzDf.listColumns());
        console.log(umsatzDf.toCollection());

        // umbuchungDf = umbuchungDf.sortBy(['Zeitstempel']);
        umbuchungDf = umbuchungDf.withColumn('ID', (row, index) => index + 1);
        var umbuchungDfFiltered = umbuchungDf.slice();

        // abschlussDf = abschlussDf.sortBy(['Zeitstempel']);
        abschlussDf = abschlussDf.withColumn('ID', (row, index) => index + 1);
        var abschlussDfFiltered = abschlussDf.slice();

        dispatch({
            type: DATAFRAME_INIT,
            payload: {
                original: {
                    umsatz: umsatzDf,
                    wiederkehrenderUmsatz: wiederkehrenderUmsatzDf,
                    kategorien: kategorienDf,
                    umbuchung: umbuchungDf,
                    abschluss: abschlussDf,
                },
                filtered: {
                    umsatz: umsatzDfFiltered,
                    umbuchung: umbuchungDfFiltered,
                    abschluss: abschlussDfFiltered,
                },
            },
        });

        const maxUmsatzDate =
            umsatzDf.count() > 0
                ? moment(umsatzDf.stat.max('Zeitstempel'))
                : moment();
        dispatch(
            setPrevFilterTimeRange([
                maxUmsatzDate.clone().startOf('month').valueOf(),
                maxUmsatzDate.clone().endOf('month').valueOf(),
            ]),
        );
        dispatch(setFilter());
        setTimeout(() => {
            dispatch({
                type: DATAFRAME_INIT_PROGRESS,
                payload: false,
            });
        }, 1500);
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: false,
        });
        dispatch(
            snackbarErrorMessage(
                'Es ist ein Fehler bei der Analyse der Dateien aufgetreten.',
            ),
        );
    }
};

const nichtGelistet = (timestamp, abschluss, umbuchung, umsatz) => {
    console.log('');
    var date = moment(timestamp);
    var letzterMonatsTag = date.clone().endOf('month');
    console.log('letzterMonatsTag', letzterMonatsTag.format('DD.MM.YYYY'));
    var monatDateRaw = date.clone().startOf('month');
    var monatDate = monatDateRaw.valueOf();
    console.log('monatDate', moment(monatDate).format('DD.MM.YYYY'));
    var naechsterMonatDate = monatDateRaw.clone().add(1, 'month').valueOf();
    console.log(
        'naechsterMonatDate',
        moment(naechsterMonatDate).format('DD.MM.YYYY'),
    );
    var vormonatDate = monatDateRaw.clone().add(-1, 'month').valueOf();
    console.log('vormonatDate', moment(vormonatDate).format('DD.MM.YYYY'));
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
        console.log('geldbestand', geldbestand);
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
        console.log('umbuchungSum', umbuchungSum);
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
        console.log('dokumentierterUmsatz', dokumentierterUmsatz);
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

const updateNichtGelistet =
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
                letzterMonatsTag.format('DD.MM.YYYY'),
                betrag,
                'Ausgabe',
                '1',
                '',
                '',
                letzterMonatsTag.valueOf(),
                betrag * -1,
                'nicht gelistet',
                'nicht gelistet',
                'variabel',
                'nicht gelistet',
                letzterMonatsTag.month() + 1,
                letzterMonatsTag.quarter(),
                letzterMonatsTag.year(),
                umsatz.count() + 1,
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

export const filterDataframe = () => (dispatch, getState) => {
    const { dataframe, filter } = getState();
    const { word, kategorien, kategorieTyp, art, typ, time } = filter;
    var { range } = time;
    // console.log(kategorien);
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
                // abschlussDfFiltered = abschlussDfFiltered.sortBy(['Zeitstempel']);
            }
        }
        if (word && word.length > 0) {
            const lowerWord = word.toLowerCase();
            umsatzDfFiltered = umsatzDfFiltered.filter(
                (row) =>
                    row.get('Bemerkung').toLowerCase().includes(lowerWord) ||
                    row.get('Datum').includes(lowerWord) ||
                    // row.get('Betrag').toLowerCase().includes(lowerWord) ||
                    row.get('Art').toLowerCase().includes(lowerWord) ||
                    row.get('Kategorie').toLowerCase().includes(lowerWord) ||
                    row.get('Typ').toLowerCase().includes(lowerWord) ||
                    row.get('Beschreibung').toLowerCase().includes(lowerWord),
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
            // console.log(kategorien);
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

export const changeUmsatz = (id, update, old) => (dispatch, getState) => {
    var { umsatz, kategorien } = getState().dataframe.original;
    var isNewTimestamp = update.timestamp !== old.timestamp;
    var newDate = moment(update.timestamp);
    umsatz = umsatz.setRow(id - 1, (row) => {
        row = row.set('Betrag', update.betrag);
        row = row.set('Art', update.art);
        row = row.set('KategorieID', update.kategorie);
        row = row.set('Beschreibung', update.beschreibung);
        row = row.set('Bemerkung', update.bemerkung);
        row = row.set(
            'Umsatz',
            update.art !== 'Einnahme' ? update.betrag * -1 : update.betrag,
        );
        if (update.kategorie !== old.kategorie) {
            var kategorie = kategorien.find(
                (row) => row.get('KategorieID') === `${update.kategorie}`,
            );
            row = row.set('Oberkategorie', kategorie.get('Oberkategorie'));
            row = row.set('Unterkategorie', kategorie.get('Unterkategorie'));
            row = row.set('Typ', kategorie.get('Typ'));
            row = row.set('Kategorie', kategorie.get('Kategorie'));
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

export const addUmsatz =
    (timestamp, art, betrag, kategorie, beschreibung, bemerkung) =>
    (dispatch, getState) => {
        var { umsatz, kategorien } = getState().dataframe.original;
        kategorie = kategorien.find(
            (row) => row.get('KategorieID') === `${kategorie}`,
        );
        var date = moment(timestamp);
        umsatz = umsatz.push([
            date.format('DD.MM.YYYY'),
            betrag,
            art,
            kategorie.get('KategorieID'),
            beschreibung,
            bemerkung,
            timestamp,
            art !== 'Einnahme' ? betrag * -1 : betrag,
            kategorie.get('Oberkategorie'),
            kategorie.get('Unterkategorie'),
            kategorie.get('Typ'),
            kategorie.get('Kategorie'),
            date.month() + 1,
            date.quarter(),
            date.year(),
            umsatz.count() + 1,
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

export const deleteUmsatz = (id, timestamp) => (dispatch, getState) => {
    var umsatzDf = getState().dataframe.original.umsatz;
    umsatzDf = umsatzDf.filter((row) => row.get('ID') !== id);
    umsatzDf = umsatzDf.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_UMSATZ,
        payload: umsatzDf,
    });
    dispatch(uploadFile('Umsatz'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Der Umsatz-Eintrag wurde erfolgreich entfernt.`));
};

export const changeUmbuchung =
    (id, timestamp, betrag, bemerkung) => (dispatch, getState) => {
        var umbuchungDf = getState().dataframe.original.umbuchung;
        umbuchungDf = umbuchungDf.setRow(id - 1, (row) => {
            row = row.set('Betrag', betrag);
            row = row.set('Bemerkung', bemerkung);
            row = row.set('Datum', moment(timestamp).format('DD.MM.YYYY'));
            row = row.set('Zeitstempel', timestamp);
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_UMBUCHUNG,
            payload: umbuchungDf,
        });
        dispatch(uploadFile('Umbuchung'));
        dispatch(updateNichtGelistet(timestamp));
        dispatch(filterDataframe());
        dispatch(snackbarMessage(`Die Umbuchung wurde erfolgreich geändert.`));
    };

export const addUmbuchung =
    (timestamp, betrag, bemerkung) => (dispatch, getState) => {
        var umbuchungDf = getState().dataframe.original.umbuchung;
        umbuchungDf = umbuchungDf.push([
            moment(timestamp).format('DD.MM.YYYY'),
            betrag,
            bemerkung,
            timestamp,
            umbuchungDf.count() + 1,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_UMBUCHUNG,
            payload: umbuchungDf,
        });
        dispatch(uploadFile('Umbuchung'));
        dispatch(updateNichtGelistet(timestamp, true));
        dispatch(filterDataframe());
        dispatch(
            snackbarMessage(`Die Umbuchung wurde erfolgreich hinzugefügt.`),
        );
    };

export const deleteUmbuchung = (id, timestamp) => (dispatch, getState) => {
    var umbuchungDf = getState().dataframe.original.umbuchung;
    umbuchungDf = umbuchungDf.filter((row) => row.get('ID') !== id);
    // umbuchungDf = umbuchungDf.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_UMBUCHUNG,
        payload: umbuchungDf,
    });
    dispatch(uploadFile('Umbuchung'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Die Umbuchung wurde erfolgreich entfernt.`));
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

export const addAbschluss =
    (timestamp, konto, bargeld) => (dispatch, getState) => {
        var abschlussDf = getState().dataframe.original.abschluss;
        var newDate = moment(timestamp);
        abschlussDf = abschlussDf.push([
            newDate.format('DD.MM.YYYY'),
            konto,
            bargeld,
            timestamp,
            konto + bargeld,
            abschlussDf.count() + 1,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_ABSCHLUSS,
            payload: abschlussDf,
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

export const deleteAbschluss = (id, timestamp) => (dispatch, getState) => {
    var abschlussDf = getState().dataframe.original.abschluss;
    abschlussDf = abschlussDf.filter((row) => row.get('ID') !== id);
    abschlussDf = abschlussDf.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_ABSCHLUSS,
        payload: abschlussDf,
    });
    dispatch(uploadFile('Abschluss'));
    dispatch(updateNichtGelistet(timestamp));
    dispatch(updateNichtGelistet(moment(timestamp).add(1, 'month').valueOf()));
    dispatch(filterDataframe());
    dispatch(snackbarMessage(`Der Abschluss wurde erfolgreich entfernt.`));
};

export const changeKategorie =
    (id, oberkategorie, unterkategorie, typ) => (dispatch, getState) => {
        const state = getState();
        var { kategorien, umsatz, wiederkehrenderUmsatz } =
            state.dataframe.original;

        const kategorie = kategorien
            .find((row) => row.get('ID') === id)
            .toDict();
        const kategorieId = kategorie['KategorieID'];
        var kategorieString = `${oberkategorie}${
            unterkategorie ? ` | ${unterkategorie}` : ''
        }`;
        kategorien = kategorien.setRow(id - 1, (row) => {
            row = row.set('Oberkategorie', oberkategorie);
            row = row.set(
                'Unterkategorie',
                unterkategorie ? unterkategorie : oberkategorie,
            );
            row = row.set('Typ', typ);
            row = row.set('Kategorie', kategorieString);
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_KATEGORIEN,
            payload: kategorien,
        });
        dispatch(uploadFile('Kategorien'));

        var changedUmsatz = umsatz.slice().chain(
            (row) => row.get('KategorieID') === kategorieId,
            (row) => row.set('Oberkategorie', oberkategorie),
            (row) =>
                row.set(
                    'Unterkategorie',
                    unterkategorie ? unterkategorie : oberkategorie,
                ),
            (row) => row.set('Kategorie', kategorieString),
            (row) => row.set('Typ', typ),
        );
        umsatz = umsatz
            .filter((row) => row.get('KategorieID') !== kategorieId)
            .union(changedUmsatz);
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });

        var changedWiederkehrenderUmsatz = wiederkehrenderUmsatz.slice().chain(
            (row) => row.get('KategorieID') === kategorieId,
            (row) => row.set('Oberkategorie', oberkategorie),
            (row) =>
                row.set(
                    'Unterkategorie',
                    unterkategorie ? unterkategorie : oberkategorie,
                ),
            (row) => row.set('Kategorie', kategorieString),
            (row) => row.set('Typ', typ),
        );
        wiederkehrenderUmsatz = wiederkehrenderUmsatz
            .filter((row) => row.get('KategorieID') !== kategorieId)
            .union(changedWiederkehrenderUmsatz);
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });

        var kategorieFilter = state.filter.kategorien;
        var kategorieFilterTyp = state.filter.kategorieTyp;
        var index = kategorieFilter.findIndex(
            (kat) => kat === kategorie[kategorieFilterTyp],
        );
        if (index > -1) {
            if (
                kategorien.countValue(
                    kategorie[kategorieFilterTyp],
                    kategorieFilterTyp,
                ) > 0
            ) {
                kategorieFilter.push(
                    kategorieFilterTyp === 'Oberkategorie'
                        ? oberkategorie
                        : unterkategorie,
                );
            } else {
                kategorieFilter[index] =
                    kategorieFilterTyp === 'Oberkategorie'
                        ? oberkategorie
                        : unterkategorie;
            }
            dispatch(setPrevFilterCategories(kategorieFilter));
            dispatch(setFilter(false));
        }

        dispatch(filterDataframe());
        dispatch(snackbarMessage(`Die Kategorie wurde erfolgreich geändert.`));
    };

export const addKategorie =
    (oberkategorie, unterkategorie, typ) => (dispatch, getState) => {
        var kategorienDf = getState().dataframe.original.kategorien;
        var kategorie = `${oberkategorie}${
            unterkategorie ? ` | ${unterkategorie}` : ''
        }`;
        kategorienDf = kategorienDf.push([
            (Number(kategorienDf.stat.max('KategorieID')) + 1).toString(),
            oberkategorie,
            unterkategorie,
            typ,
            kategorie,
            kategorienDf.count() + 1,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_KATEGORIEN,
            payload: kategorienDf,
        });
        dispatch(uploadFile('Kategorien'));
        dispatch(
            snackbarMessage(`Die Kategorie wurde erfolgreich hinzugefügt.`),
        );
    };

export const deleteKategorie = (id) => (dispatch, getState) => {
    const state = getState();
    var { kategorien, umsatz, wiederkehrenderUmsatz } =
        state.dataframe.original;
    var kategorie = kategorien.find((row) => row.get('ID') === id).toDict();
    var kategorieId = kategorie['KategorieID'];
    kategorien = kategorien.filter((row) => row.get('ID') !== id);
    kategorien = kategorien.withColumn('ID', (row, index) => index + 1);
    dispatch({
        type: DATAFRAME_ORIGINAL_KATEGORIEN,
        payload: kategorien,
    });
    dispatch(uploadFile('Kategorien'));
    var changedUmsatzCount = umsatz.countValue(kategorieId, 'KategorieID');
    if (changedUmsatzCount > 0) {
        var changedUmsatz = umsatz.slice().chain(
            (row) => row.get('KategorieID') === kategorieId,
            (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
            (row) => row.set('Unterkategorie', ''),
            (row) => row.set('Kategorie', 'nicht zugeordnet'),
            (row) => row.set('Typ', 'variabel'),
            (row) => row.set('KategorieID', '2'),
        );
        umsatz = umsatz
            .filter((row) => row.get('KategorieID') !== kategorieId)
            .union(changedUmsatz);
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });
    }
    var changedWiederkehrenderUmsatz = wiederkehrenderUmsatz.slice().chain(
        (row) => row.get('KategorieID') === kategorieId,
        (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
        (row) => row.set('Unterkategorie', ''),
        (row) => row.set('Kategorie', 'nicht zugeordnet'),
        (row) => row.set('Typ', 'variabel'),
        (row) => row.set('KategorieID', '2'),
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz
        .filter((row) => row.get('KategorieID') !== kategorieId)
        .union(changedWiederkehrenderUmsatz);
    dispatch({
        type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
        payload: wiederkehrenderUmsatz,
    });

    var kategorieFilterTyp = state.filter.kategorieTyp;
    if (
        kategorien.countValue(
            kategorie[kategorieFilterTyp],
            kategorieFilterTyp,
        ) === 0
    ) {
        var kategorieFilter = state.filter.kategorien;
        var newKategorieFilter = kategorieFilter.filter(
            (kat) => kat !== kategorie[kategorieFilterTyp],
        );
        if (kategorieFilter.length > newKategorieFilter.length) {
            dispatch(setPrevFilterCategories(newKategorieFilter));
            dispatch(setFilter(false));
        }
    }
    dispatch(filterDataframe());
    dispatch(
        snackbarMessage(
            `Die Kategorie wurde erfolgreich entfernt.${
                changedUmsatzCount > 0
                    ? ` ${changedUmsatzCount} Umsätze wurden auf "nicht zugeordnet" gestellt.`
                    : ''
            }`,
        ),
    );
};

export const changeWiederkehrenderUmsatz =
    (id, update, old) => (dispatch, getState) => {
        var { wiederkehrenderUmsatz, kategorien, abschluss } =
            getState().dataframe.original;
        var newDate = false;
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.setRow(id - 1, (row) => {
            if (update.Tag !== old.Tag) {
                if (row.get('Datum') !== '') newDate = true;
                row = row.set('Tag', update.tag);
                row = row.set('Datum', '');
                row = row.set('Zeitstempel', '');
            }
            row = row.set('Betrag', update.betrag);
            row = row.set('Art', update.art);
            row = row.set('KategorieID', update.kategorie);
            row = row.set('Beschreibung', update.beschreibung);
            row = row.set('Bemerkung', update.bemerkung);
            row = row.set(
                'Umsatz',
                update.art !== 'Einnahme' ? update.betrag * -1 : update.betrag,
            );
            if (update.kategorie !== old.kategorie) {
                var kategorie = kategorien.find(
                    (row) => row.get('KategorieID') === `${update.kategorie}`,
                );
                row = row.set('Oberkategorie', kategorie.get('Oberkategorie'));
                row = row.set(
                    'Unterkategorie',
                    kategorie.get('Unterkategorie'),
                );
                row = row.set('Typ', kategorie.get('Typ'));
                row = row.set('Kategorie', kategorie.get('Kategorie'));
            }
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        if (newDate) {
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
            dispatch({
                type: DATAFRAME_ORIGINAL_ABSCHLUSS,
                payload: abschluss,
            });
        }

        dispatch(
            snackbarMessage(
                `Die wiederkehrende ${update.art} wurde erfolgreich aktualisiert. Die Änderungen werden erst beim nächsten Monat wirksam.`,
            ),
        );
    };

export const addWiederkehrenderUmsatz =
    (tag, art, betrag, kategorie, beschreibung, bemerkung) =>
    (dispatch, getState) => {
        var { wiederkehrenderUmsatz, kategorien } =
            getState().dataframe.original;
        kategorie = kategorien.find(
            (row) => row.get('KategorieID') === `${kategorie}`,
        );
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.push([
            tag,
            '',
            betrag,
            art,
            kategorie.get('KategorieID'),
            beschreibung,
            bemerkung,
            '',
            art !== 'Einnahme' ? betrag * -1 : betrag,
            kategorie.get('Oberkategorie'),
            kategorie.get('Unterkategorie'),
            kategorie.get('Typ'),
            kategorie.get('Kategorie'),
            wiederkehrenderUmsatz.count() + 1,
        ]);

        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        dispatch(
            snackbarMessage(
                `Die wiederkehrende ${art} wurde erfolgreich hinzugefügt und wird beim nächsten Monat wirksam.`,
            ),
        );
    };

export const deleteWiederkehrenderUmsatz = (id) => (dispatch, getState) => {
    var wiederkehrenderUmsatzDf =
        getState().dataframe.original.wiederkehrenderUmsatz;
    wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.filter(
        (row) => row.get('ID') !== id,
    );
    wiederkehrenderUmsatzDf = wiederkehrenderUmsatzDf.withColumn(
        'ID',
        (row, index) => index + 1,
    );
    dispatch({
        type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
        payload: wiederkehrenderUmsatzDf,
    });
    dispatch(uploadFile('wiederkehrenderUmsatz'));
    dispatch(
        snackbarMessage(
            `Der wiederkehrende Umsatz wurde erfolgreich entfernt und wird beim nächsten Monat nicht mehr berücksichtigt.`,
        ),
    );
};

const calcOstern = (jahr) => {
    var a = jahr % 19;
    var d = (19 * a + 24) % 30;
    var tag = d + ((2 * (jahr % 4) + 4 * (jahr % 7) + 6 * d + 5) % 7);
    if (tag === 35 || (tag === 34 && d === 28 && a > 10)) {
        tag -= 7;
    }
    var datum = new Date(jahr, 2, 22);
    // 86400000 = 24 h * 60 min * 60 s * 1000 ms
    datum.setTime(datum.getTime() + 86400000 * tag);
    return moment(datum);
};

const calcFeiertage = (jahr, monat) => {
    var feiertage = [];
    switch (monat) {
        case 1:
            feiertage.push(moment({ year: jahr, month: monat - 1, day: 1 })); // Neujahr
            break;
        case 3:
        case 4:
        case 5:
        case 6:
            const ostern = calcOstern(jahr);
            const ostertage = [
                ostern.clone().add(-2, 'day'), // Karfreitag
                ostern.clone().add(1, 'day'), // Ostermontag
                ostern.clone().add(39, 'day'), // Christi Himmelfahrt
                ostern.clone().add(50, 'day'), // Pfingsmontag
                ostern.clone().add(60, 'day'), // Fronleichnam
                moment({ year: jahr, month: 5 - 1, day: 1 }), // Tag der Arbeit
            ];
            feiertage = ostertage.filter((tage) => tage.month() === monat - 1);
            break;
        case 10:
            feiertage.push(moment({ year: jahr, month: monat - 1, day: 3 })); // Tag der dt. Einheit
            break;
        case 11:
            feiertage.push(moment({ year: jahr, month: monat - 1, day: 1 })); // Allerheiligen
            break;
        case 12:
            feiertage = [
                moment({ year: jahr, month: monat - 1, day: 24 }), // Heiligabend
                moment({ year: jahr, month: monat - 1, day: 25 }), // 1. Weihnachtstag
                moment({ year: jahr, month: monat - 1, day: 26 }), // 2. Weihnachtstag
                moment({ year: jahr, month: monat - 1, day: 31 }), // Silvester
            ];
            break;
        default:
            break;
    }
    return feiertage;
};

const calcDate = (datum, monat, feiertage, trend = 0) => {
    datum = datum.add(trend, 'day');
    // console.log(datum.format('DD.MM.YYYY'), trend);
    if (datum.month() + 1 !== monat) {
        trend = -1;
        datum = calcDate(datum, monat, feiertage, trend);
    } else {
        if (trend === 0) {
            trend = 1;
        }
        // else {
        //     diff = diff + 1;
        // }
        if (datum.weekday() > 4) {
            datum = calcDate(datum, monat, feiertage, trend);
        } else {
            feiertage.forEach((tag) => {
                // console.log(
                //     '\n',
                //     tag.format('DD.MM.YYYY'),
                //     datum.format('DD.MM.YYYY')
                // );
                // console.log(tag.valueOf(), datum.valueOf());
                if (tag.valueOf() === datum.valueOf()) {
                    datum = calcDate(datum, monat, feiertage, trend);
                }
            });
        }
    }
    return datum;
};

const addMonatsposten = (jahr, monat) => (dispatch, getState) => {
    var { umsatz, wiederkehrenderUmsatz } = getState().dataframe.original;
    const count = wiederkehrenderUmsatz.count();
    if (count > 0) {
        const feiertage = calcFeiertage(jahr, monat);
        var index = 0;
        while (index < count) {
            const row = wiederkehrenderUmsatz.getRow(index);
            const datum = calcDate(
                moment({
                    year: jahr,
                    month: monat - 1,
                    day: row.get('Tag'),
                }),
                monat,
                feiertage,
            );
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.setRow(
                index,
                (row) => {
                    row = row.set('Datum', datum.format('DD.MM.YYYY'));
                    row = row.set('Zeitstempel', datum.valueOf());
                    return row;
                },
            );
            umsatz = umsatz.push([
                datum.format('DD.MM.YYYY'),
                row.get('Betrag'),
                row.get('Art'),
                row.get('KategorieID'),
                row.get('Beschreibung'),
                row.get('Bemerkung'),
                datum.valueOf(),
                row.get('Art') !== 'Einnahme'
                    ? row.get('Betrag') * -1
                    : row.get('Betrag'),
                row.get('Oberkategorie'),
                row.get('Unterkategorie'),
                row.get('Typ'),
                row.get('Kategorie'),
                datum.month() + 1,
                datum.quarter(),
                datum.year(),
                umsatz.count() + 1,
            ]);
            index++;
        }
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(
            updateNichtGelistet(
                moment({ year: jahr, month: monat - 1, day: 1 }).valueOf(),
            ),
        );
        // dispatch(uploadFile('Umsatz'));#
        // dispatch(uploadFile('wiederkehrenderUmsatz'));
        dispatch(filterDataframe());
        dispatch(
            snackbarMessage(
                `Alle ${count} hinterlegten wiederkehrenden Umsätze wurden erfolgreich hinzugefügt.`,
            ),
        );
    }
};
