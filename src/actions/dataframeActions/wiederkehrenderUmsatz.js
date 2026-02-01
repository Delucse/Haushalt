import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { uploadFile } from '../fileActions';
import { snackbarMessage } from '../messageActions';

import {
    DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
    DATAFRAME_ORIGINAL_ABSCHLUSS,
    DATAFRAME_ORIGINAL_UMSATZ,
} from '../types';
import { updateNichtGelistet } from './umsatzActions';
import { filterDataframe } from '../filterActions';

export const initWiederkehrenderUmsatz = async (file, kategorien) => {
    var wiederkehrenderUmsatz = await DataFrame.fromText(file, ';');
    if (!wiederkehrenderUmsatz.listColumns().includes('Datum')) {
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
            'Datum',
            () => '',
        );
    }
    if (!wiederkehrenderUmsatz.listColumns().includes('Kategorie')) {
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.rename(
            'KategorieID',
            'Kategorie',
        );
    }
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.filter(
        (row) =>
            row.get('Tag') !== undefined &&
            row.get('Datum') !== undefined &&
            row.get('Betrag') !== undefined &&
            row.get('Art') !== undefined &&
            row.get('Kategorie') !== undefined &&
            row.get('Beschreibung') !== undefined &&
            row.get('Bemerkung') !== undefined,
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.rename(
        'Kategorie',
        'KategorieID',
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
        'Zeitstempel',
        (row) => moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.cast(
        'Betrag',
        (val) => val && Number(val.replace(',', '.')),
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
        'Umsatz',
        (row) => {
            if (row.get('Art') === 'Einnahme') {
                return row.get('Betrag');
            } else {
                return row.get('Betrag') * -1;
            }
        },
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.join(
        kategorien,
        'KategorieID',
        'left',
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
        'ID',
        (row, index) => index + 1,
    );
    return wiederkehrenderUmsatz;
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

export const deleteWiederkehrenderUmsatz = (id) => (dispatch, getState) => {
    var wiederkehrenderUmsatz =
        getState().dataframe.original.wiederkehrenderUmsatz;
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.filter(
        (row) => row.get('ID') !== id,
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
        'ID',
        (row, index) => index + 1,
    );
    dispatch({
        type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
        payload: wiederkehrenderUmsatz,
    });
    dispatch(uploadFile('wiederkehrenderUmsatz'));
    dispatch(
        snackbarMessage(
            `Der wiederkehrende Umsatz wurde erfolgreich entfernt und wird beim nächsten Monat nicht mehr berücksichtigt.`,
        ),
    );
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

export const addMonatsposten = (jahr, monat) => (dispatch, getState) => {
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
        dispatch(filterDataframe());
        dispatch(
            snackbarMessage(
                `Alle ${count} hinterlegten wiederkehrenden Umsätze wurden erfolgreich hinzugefügt.`,
            ),
        );
    }
};
