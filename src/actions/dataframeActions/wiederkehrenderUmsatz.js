import moment from 'moment/moment';
import DataFrame from 'dataframe-js';

import { updateNichtGelistet } from './umsatzActions';
import { filterDataframe } from '../filterActions';
import { uploadFile } from '../fileActions';
import { snackbarMessage } from '../messageActions';

import {
    DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
    DATAFRAME_ORIGINAL_UMSATZ,
} from '../types';

export const initWiederkehrenderUmsatz = async (file, kategorien) => {
    var wiederkehrenderUmsatz = await DataFrame.fromText(file, ';');
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.filter(
        (row) =>
            row.get('Tag') !== undefined &&
            row.get('Betrag') !== undefined &&
            row.get('Art') !== undefined &&
            row.get('Kategorie') !== undefined &&
            row.get('Beschreibung') !== undefined &&
            row.get('Bemerkung') !== undefined &&
            row.get('Tags') !== undefined,
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.rename(
        'Kategorie',
        'KategorieID',
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.cast('Tag', (val) =>
        Number(val),
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.cast('Betrag', (val) =>
        Number(val),
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
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn('Tags', (row) =>
        row.get('Tags').length > 0 ? row.get('Tags').split('|') : [],
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.join(
        kategorien,
        'KategorieID',
        'left',
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
        'Index',
        (row, index) => index + 1,
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn('ID', (row) =>
        row.get('Index'),
    );
    wiederkehrenderUmsatz = wiederkehrenderUmsatz.restructure([
        'Index',
        'ID',
        'Tag',
        'Betrag',
        'Art',
        'Umsatz',
        'KategorieID',
        'Kategorie',
        'Oberkategorie',
        'Unterkategorie',
        'Beschreibung',
        'Bemerkung',
        'Tags',
    ]);
    return wiederkehrenderUmsatz;
};

export const addWiederkehrenderUmsatz =
    (
        tag,
        art,
        betrag,
        kategorie,
        beschreibung,
        bemerkung,
        tags,
        zeitstempel = '',
    ) =>
    (dispatch, getState) => {
        var { wiederkehrenderUmsatz, kategorien, umsatz } =
            getState().dataframe.original;
        kategorie = kategorien.find(
            (row) => row.get('KategorieID') === `${kategorie}`,
        );
        var id = wiederkehrenderUmsatz.stat.max('ID') + 1,
            index = wiederkehrenderUmsatz.count() + 1,
            wid,
            addUmsatz = Boolean(zeitstempel);
        if (addUmsatz) {
            var maxUmsatz = Math.max(
                zeitstempel,
                umsatz.stat.max('Zeitstempel'),
            );
            if (moment(zeitstempel).isSame(maxUmsatz, 'month')) {
                wid = id;
            }
        }
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.push([
            index,
            id,
            tag,
            betrag,
            art,
            art !== 'Einnahme' ? betrag * -1 : betrag,
            kategorie.get('KategorieID'),
            kategorie.get('Kategorie'),
            kategorie.get('Oberkategorie'),
            kategorie.get('Unterkategorie'),
            beschreibung,
            bemerkung,
            tags,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        setTimeout(
            () => {
                dispatch(
                    snackbarMessage(
                        `Die ${addUmsatz ? 'zugehörige ' : ''}wiederkehrende ${art} wurde erfolgreich hinzugefügt.`,
                    ),
                );
            },
            addUmsatz ? 500 : 0,
        );
        return wid;
    };

export const changeWiederkehrenderUmsatz =
    (id, update, wid = true) =>
    (dispatch, getState) => {
        var { wiederkehrenderUmsatz, kategorien } =
            getState().dataframe.original;
        const index = wiederkehrenderUmsatz.find({ ID: id }).get('Index'),
            changeUmsatz = !('tag' in update);
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.setRow(
            index - 1,
            (row) => {
                if (!changeUmsatz) {
                    row = row.set('Tag', update.tag);
                }
                row = row.set('Betrag', update.betrag);
                row = row.set('Art', update.art);
                row = row.set(
                    'Umsatz',
                    update.art !== 'Einnahme'
                        ? update.betrag * -1
                        : update.betrag,
                );
                row = row.set('Beschreibung', update.beschreibung);
                row = row.set('Bemerkung', update.bemerkung);
                row = row.set('Tags', update.tags);

                if (update.kategorie !== row.get('KategorieID')) {
                    row = row.set('KategorieID', update.kategorie);
                    var kategorie = kategorien.find(
                        (row) =>
                            row.get('KategorieID') === `${update.kategorie}`,
                    );
                    row = row.set('Kategorie', kategorie.get('Kategorie'));
                    row = row.set(
                        'Oberkategorie',
                        kategorie.get('Oberkategorie'),
                    );
                    row = row.set(
                        'Unterkategorie',
                        kategorie.get('Unterkategorie'),
                    );
                }
                return row;
            },
        );
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        if (wid) {
            dispatch(removeWid(id));
        }
        setTimeout(
            () => {
                dispatch(
                    snackbarMessage(
                        `Die ${changeUmsatz ? 'zugehörige ' : ''}wiederkehrende ${update.art} wurde erfolgreich aktualisiert.`,
                    ),
                );
            },
            changeUmsatz ? 500 : 0,
        );
    };

export const deleteWiederkehrenderUmsatz =
    (id, wid = true) =>
    (dispatch, getState) => {
        var { wiederkehrenderUmsatz } = getState().dataframe.original;
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.filter(
            (row) => row.get('ID') !== id,
        );
        wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
            'Index',
            (row, index) => index + 1,
        );
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        if (wid) {
            dispatch(removeWid(id));
        }
        setTimeout(
            () => {
                dispatch(
                    snackbarMessage(
                        `Der ${wid ? '' : 'zugehörige '}wiederkehrende Umsatz wurde erfolgreich entfernt.`,
                    ),
                );
            },
            wid ? 0 : 500,
        );
    };

const removeWid = (id) => (dispatch, getState) => {
    var { umsatz } = getState().dataframe.original;
    const uid = umsatz.find({ WID: id })?.get('ID');
    if (uid) {
        umsatz = umsatz.setRow(uid - 1, (row) => {
            row = row.set('WID', null);
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });
        dispatch(filterDataframe());
    }
};

export const calcFeiertage = (jahr, monat) => {
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

const isWochenende = (datum) => {
    return datum.weekday() > 4;
};

const isFeiertag = (datum, feiertage) => {
    return feiertage.some((f) => f.valueOf() === datum.valueOf());
};

const dateIsValid = (datum, feiertage) => {
    return !isWochenende(datum) && !isFeiertag(datum, feiertage);
};

export const calcDate = (jahr, monat, tag, feiertage) => {
    var datum = moment([jahr, monat - 1, tag]);
    if (!datum.isValid()) {
        datum = moment([
            jahr,
            monat - 1,
            moment([jahr, monat - 1]).daysInMonth(),
        ]);
    }
    // zuerst das Ursprungsdatum prüfen
    if (dateIsValid(datum, feiertage)) {
        return datum;
    }
    // vorwärts suchen
    let forward = datum.clone().add(1, 'day');
    while (forward.month() + 1 === monat) {
        if (dateIsValid(forward, feiertage)) {
            return forward;
        }
        forward.add(1, 'day');
    }
    // rückwärts suchen
    let backward = datum.clone().subtract(1, 'day');
    while (backward.month() + 1 === monat) {
        if (dateIsValid(backward, feiertage)) {
            return backward;
        }
        backward.subtract(1, 'day');
    }
    // nichts gefunden → unmöglich
    return datum;
};

export const addMonatsposten = (jahr, monat) => (dispatch, getState) => {
    var { umsatz, wiederkehrenderUmsatz } = getState().dataframe.original;
    umsatz = umsatz.withColumn('WID', () => null);
    const count = wiederkehrenderUmsatz.count();
    if (count > 0) {
        const feiertage = calcFeiertage(jahr, monat);
        var index = 0;
        while (index < count) {
            const row = wiederkehrenderUmsatz.getRow(index);
            const datum = calcDate(jahr, monat, row.get('Tag'), feiertage);
            umsatz = umsatz.push([
                umsatz.count() + 1,
                datum.format('DD.MM.YYYY'),
                datum.valueOf(),
                datum.month() + 1,
                datum.quarter(),
                datum.year(),
                row.get('Betrag'),
                row.get('Art'),
                row.get('Art') !== 'Einnahme'
                    ? row.get('Betrag') * -1
                    : row.get('Betrag'),
                'fix',
                row.get('KategorieID'),
                row.get('Kategorie'),
                row.get('Oberkategorie'),
                row.get('Unterkategorie'),
                row.get('Beschreibung'),
                row.get('Bemerkung'),
                row.get('Tags'),
                row.get('ID'),
            ]);
            index++;
        }
        dispatch({
            type: DATAFRAME_ORIGINAL_UMSATZ,
            payload: umsatz,
        });
        dispatch(uploadFile('Umsatz'));
        dispatch({
            type: DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
            payload: wiederkehrenderUmsatz,
        });
        dispatch(uploadFile('wiederkehrenderUmsatz'));
        dispatch(
            updateNichtGelistet(
                moment({ year: jahr, month: monat - 1, day: 1 }).valueOf(),
            ),
        );
        dispatch(filterDataframe());
        setTimeout(() => {
            dispatch(
                snackbarMessage(
                    `Alle ${count} hinterlegten wiederkehrenden Umsätze wurden erfolgreich hinzugefügt.`,
                ),
            );
        }, 500);
    }
};
