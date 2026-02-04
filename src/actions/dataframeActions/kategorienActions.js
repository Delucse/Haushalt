import DataFrame from 'dataframe-js';

import { filterDataframe } from '../filterActions';
import { uploadFile } from '../fileActions';
import { setPrevFilterCategories, setFilter } from '../filterActions';
import { snackbarMessage } from '../messageActions';

import {
    DATAFRAME_ORIGINAL_UMSATZ,
    DATAFRAME_ORIGINAL_KATEGORIEN,
    DATAFRAME_ORIGINAL_WIEDERKEHRENDERUMSATZ,
} from '../types';

export const initKategorien = async (file) => {
    var kategorien = await DataFrame.fromText(file, ';');
    kategorien = kategorien.filter(
        (row) =>
            row.get('ID') !== undefined &&
            row.get('Oberkategorie') !== undefined &&
            row.get('Unterkategorie') !== undefined,
    );
    kategorien = kategorien.rename('ID', 'KategorieID');
    kategorien = kategorien.push(
        ['1', 'nicht gelistet', ''],
        ['2', 'nicht zugeordnet', ''],
    );
    kategorien = kategorien.withColumn('Kategorie', (row) => {
        var kategorie = row.get('Oberkategorie');
        if (row.get('Unterkategorie')) {
            kategorie += ' | ' + row.get('Unterkategorie');
        }
        return kategorie;
    });
    kategorien = kategorien.withColumn('Unterkategorie', (row) => {
        const unterkategorie = row.get('Unterkategorie');
        if (unterkategorie !== '') return unterkategorie;
        return row.get('Oberkategorie');
    });
    kategorien = kategorien.withColumn('ID', (row, index) => index + 1);
    kategorien = kategorien.restructure([
        'ID',
        'KategorieID',
        'Kategorie',
        'Oberkategorie',
        'Unterkategorie',
    ]);
    return kategorien;
};

export const addKategorie =
    (oberkategorie, unterkategorie) => (dispatch, getState) => {
        var kategorien = getState().dataframe.original.kategorien;
        var kategorie = `${oberkategorie}${
            unterkategorie ? ` | ${unterkategorie}` : ''
        }`;
        kategorien = kategorien.push([
            kategorien.count() + 1,
            (Number(kategorien.stat.max('KategorieID')) + 1).toString(),
            kategorie,
            oberkategorie,
            unterkategorie,
        ]);
        dispatch({
            type: DATAFRAME_ORIGINAL_KATEGORIEN,
            payload: kategorien,
        });
        dispatch(uploadFile('Kategorien'));
        dispatch(
            snackbarMessage(`Die Kategorie wurde erfolgreich hinzugefügt.`),
        );
    };

export const changeKategorie =
    (id, oberkategorie, unterkategorie) => (dispatch, getState) => {
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
            row = row.set('Kategorie', kategorieString);
            row = row.set('Oberkategorie', oberkategorie);
            row = row.set(
                'Unterkategorie',
                unterkategorie ? unterkategorie : oberkategorie,
            );
            return row;
        });
        dispatch({
            type: DATAFRAME_ORIGINAL_KATEGORIEN,
            payload: kategorien,
        });
        dispatch(uploadFile('Kategorien'));

        var changedUmsatz = umsatz.slice().chain(
            (row) => row.get('KategorieID') === kategorieId,
            (row) => row.set('Kategorie', kategorieString),
            (row) => row.set('Oberkategorie', oberkategorie),
            (row) =>
                row.set(
                    'Unterkategorie',
                    unterkategorie ? unterkategorie : oberkategorie,
                ),
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
            (row) => row.set('Kategorie', kategorieString),
            (row) => row.set('Oberkategorie', oberkategorie),
            (row) =>
                row.set(
                    'Unterkategorie',
                    unterkategorie ? unterkategorie : oberkategorie,
                ),
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
            (row) => row.set('KategorieID', '2'),
            (row) => row.set('Kategorie', 'nicht zugeordnet'),
            (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
            (row) => row.set('Unterkategorie', ''),
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
        (row) => row.set('KategorieID', '2'),
        (row) => row.set('Kategorie', 'nicht zugeordnet'),
        (row) => row.set('Oberkategorie', 'nicht zugeordnet'),
        (row) => row.set('Unterkategorie', ''),
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
