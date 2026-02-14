import { FilenSDK } from '@filen/sdk';

import {
    FILE_CHANGED,
    FILE_ERROR,
    FILE_SUCCESS,
    FILE_PROGRESS,
    DATAFRAME_INIT_PROGRESS,
    AUTH_TYPE,
} from './types';

import { initDataframe } from './dataframeActions/initActions';
import {
    alertErrorMessage,
    resetMessage,
    snackbarMessage,
} from './messageActions';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import moment from 'moment';

const changeFile = (changed) => (dispatch) => {
    dispatch({
        type: FILE_CHANGED,
        payload: changed,
    });
};

const openZipFolder = async () => {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/zip';
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                JSZip.loadAsync(input.files[0]).then(
                    (zip) => {
                        const filenames = Object.keys(zip.files).map(
                            (filename) => filename,
                        );
                        const promises = Promise.all(
                            filenames.map((filename) =>
                                zip.files[filename].async('blob').then(
                                    (blob) =>
                                        new File([blob], filename, {
                                            type: 'text/csv',
                                        }),
                                ),
                            ),
                        );
                        promises.then((files) => {
                            resolve(files);
                        });
                    },
                    (e) => {
                        console.log(e);
                        resolve('error');
                    },
                );
            } else {
                resolve('error');
            }
        });
        input.addEventListener('cancel', () => {
            resolve(null);
        });
        if ('showPicker' in HTMLInputElement.prototype) {
            input.showPicker();
        } else {
            input.click();
        }
    });
};

export const setFilesLocale = () => async (dispatch) => {
    try {
        const filesInZipFolder = await openZipFolder();
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: true,
        });
        dispatch(resetMessage());
        if (!filesInZipFolder) {
            dispatch({
                type: FILE_ERROR,
                payload: null,
            });
            dispatch({
                type: DATAFRAME_INIT_PROGRESS,
                payload: null,
            });
        } else {
            const payload = {};
            Array.from(filesInZipFolder).forEach(async (file) => {
                switch (file.name) {
                    case 'Umsatz.csv':
                        payload.umsatz = file;
                        break;
                    case 'wiederkehrenderUmsatz.csv':
                        payload.wiederkehrenderUmsatz = file;
                        break;
                    case 'Kategorien.csv':
                        payload.kategorien = file;
                        break;
                    case 'Umbuchung.csv':
                        payload.umbuchung = file;
                        break;
                    case 'Abschluss.csv':
                        payload.abschluss = file;
                        break;
                    default:
                        break;
                }
            });
            dispatch({
                type: AUTH_TYPE,
                payload: 'locale',
            });
            if (Object.keys(payload).length !== 5) {
                throw new Error('Dataset is incomplete');
            }
            dispatch({
                type: FILE_SUCCESS,
                payload,
            });
            dispatch(initDataframe());
        }
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: FILE_ERROR,
            payload: null,
        });
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: null,
        });
        dispatch(
            alertErrorMessage(
                <div>
                    Stelle sicher, dass alle benötigten Dateien im gewählten
                    ZIP-Ordner vorhanden sind. Alternativ kannst du <br />
                    <span
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                        onClick={() => dispatch(uploadRaw())}
                    >
                        hier
                    </span>{' '}
                    die benötigten Dateien erstellen.
                </div>,
                'localeImport',
            ),
        );
    }
};

export const setFilesFilen = (uuid) => async (dispatch, getState) => {
    try {
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: true,
        });
        dispatch(resetMessage());
        const token = getState().auth.token;
        const filen = new FilenSDK({
            metadataCache: true, // Cache decrypted metadata in memory. Recommended.
            connectToSocket: false, // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
            ...token,
        });
        // https://github.com/FilenCloudDienste/filen-sdk-ts/blob/00247846f311ac6916c7bcc9a9498ed17119493b/src/cloud/index.ts#L3222C15-L3222C31
        const items = await filen.cloud().getDirectoryTree({
            uuid: token.baseFolderUUID,
        });
        const path = Object.keys(items).filter(
            (i) => items[i].uuid === uuid,
        )[0];

        var filePath = path + '/Kategorien.csv';
        var download = new Response(
            filen.cloud().downloadFileToReadableStream(items[filePath]),
        );
        var file = await download.text();
        var blob = new Blob([file], { type: items[filePath].mime });
        var kategorien = new File([blob], items[filePath].name, {
            type: items[filePath].mime,
        });

        filePath = path + '/Umsatz.csv';
        download = new Response(
            filen.cloud().downloadFileToReadableStream(items[filePath]),
        );
        file = await download.text();
        blob = new Blob([file], { type: items[filePath].mime });
        var umsatz = new File([blob], items[filePath].name, {
            type: items[filePath].mime,
        });

        filePath = path + '/wiederkehrenderUmsatz.csv';
        download = new Response(
            filen.cloud().downloadFileToReadableStream(items[filePath]),
        );
        file = await download.text();
        blob = new Blob([file], { type: items[filePath].mime });
        var wiederkehrenderUmsatz = new File([blob], items[filePath].name, {
            type: items[filePath].mime,
        });

        filePath = path + '/Umbuchung.csv';
        download = new Response(
            filen.cloud().downloadFileToReadableStream(items[filePath]),
        );
        file = await download.text();
        blob = new Blob([file], { type: items[filePath].mime });
        var umbuchung = new File([blob], items[filePath].name, {
            type: items[filePath].mime,
        });

        filePath = path + '/Abschluss.csv';
        download = new Response(
            filen.cloud().downloadFileToReadableStream(items[filePath]),
        );
        file = await download.text();
        blob = new Blob([file], { type: items[filePath].mime });
        var abschluss = new File([blob], items[filePath].name, {
            type: items[filePath].mime,
        });

        dispatch({
            type: FILE_SUCCESS,
            payload: {
                uuid,
                umsatz,
                wiederkehrenderUmsatz,
                kategorien,
                umbuchung,
                abschluss,
            },
        });
        dispatch(initDataframe());
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: FILE_ERROR,
            payload: uuid,
        });
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: null,
        });
        dispatch(
            alertErrorMessage(
                <div>
                    Stelle sicher, dass alle benötigten Dateien im gewählten
                    Ordner vorhanden sind. Alternativ kannst du <br />
                    <span
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                        onClick={() => dispatch(uploadRaw(uuid))}
                    >
                        hier
                    </span>{' '}
                    die benötigten Dateien erstellen.
                </div>,
                'tree',
            ),
        );
    }
};

const uploadRaw = (uuid) => (dispatch) => {
    dispatch({
        type: DATAFRAME_INIT_PROGRESS,
        payload: true,
    });
    dispatch(resetMessage());
    var blob = new Blob(
        ['Datum;Betrag;Art;Typ;Kategorie;Beschreibung;Bemerkung\n\r'],
        {
            type: 'text/csv',
        },
    );
    var umsatz = new File([blob], 'Umsatz.csv', {
        type: 'text/csv',
    });
    blob = new Blob(
        ['Tag;Datum;Betrag;Art;Kategorie;Beschreibung;Bemerkung\n\r'],
        {
            type: 'text/csv',
        },
    );
    var wiederkehrenderUmsatz = new File([blob], 'wiederkehrenderUmsatz.csv', {
        type: 'text/csv',
    });
    blob = new Blob(['Datum;Betrag;Bemerkung\n\r'], {
        type: 'text/csv',
    });
    var umbuchung = new File([blob], 'Umbuchung.csv', {
        type: 'text/csv',
    });
    blob = new Blob(['ID;Oberkategorie;Unterkategorie\n\r'], {
        type: 'text/csv',
    });
    var kategorien = new File([blob], 'Kategorien.csv', {
        type: 'text/csv',
    });
    blob = new Blob(['Datum;Konto;Bargeld\n\r'], {
        type: 'text/csv',
    });
    var abschluss = new File([blob], 'Abschluss.csv', {
        type: 'text/csv',
    });

    dispatch({
        type: FILE_SUCCESS,
        payload: {
            uuid,
            umsatz,
            wiederkehrenderUmsatz,
            kategorien,
            umbuchung,
            abschluss,
        },
    });
    dispatch(initDataframe());
    if (uuid) {
        setTimeout(() => {
            dispatch(uploadFiles());
        }, 1000);
    }
};

const getFile = (fileName) => (dispatch, getState) => {
    var fileContent = '';
    switch (fileName) {
        case 'Kategorien':
            const kategorienDf = getState().dataframe.original.kategorien;
            fileContent = kategorienDf
                .filter((row) => row.get('KategorieID') > 2)
                .withColumn('Unterkategorie', (row) => {
                    const kategorien = row.get('Kategorie').split(' | ');
                    if (kategorien.length > 1) {
                        return kategorien[1];
                    }
                    return '';
                })
                .select('KategorieID', 'Oberkategorie', 'Unterkategorie')
                .rename('KategorieID', 'ID')
                .toText(';');
            break;
        case 'Umsatz':
            const umsatzDf = getState().dataframe.original.umsatz;
            fileContent = umsatzDf
                .filter((row) => row.get('KategorieID') > 1)
                .select(
                    'Datum',
                    'Betrag',
                    'Art',
                    'Typ',
                    'KategorieID',
                    'Beschreibung',
                    'Bemerkung',
                )
                .rename('KategorieID', 'Kategorie')
                .toText(';');
            break;
        case 'wiederkehrenderUmsatz':
            const wiederkehrenderUmsatzDf =
                getState().dataframe.original.wiederkehrenderUmsatz;
            fileContent = wiederkehrenderUmsatzDf
                .select(
                    'Tag',
                    'Datum',
                    'Betrag',
                    'Art',
                    'KategorieID',
                    'Beschreibung',
                    'Bemerkung',
                )
                .rename('KategorieID', 'Kategorie')
                .toText(';');
            break;
        case 'Abschluss':
            const abschlussDf = getState().dataframe.original.abschluss;
            fileContent = abschlussDf
                .select('Datum', 'Konto', 'Bargeld')
                .toText(';');
            break;
        case 'Umbuchung':
            const umbuchungDf = getState().dataframe.original.umbuchung;
            fileContent = umbuchungDf
                .select('Datum', 'Betrag', 'Bemerkung')
                .toText(';');
            break;
        default:
            break;
    }
    if (!fileContent.includes('\n')) {
        fileContent += '\n\r';
    }
    console.log(fileContent);
    return new Blob([fileContent], { type: 'text/csv' });
};

export const uploadFile = (fileName) => (dispatch, getState) => {
    const state = getState();
    if (state.settings.autoSave || state.file.progress) {
        const type = state.auth.type;
        const file = dispatch(getFile(fileName));
        switch (type) {
            case 'filen':
                dispatch(uploadFileFilen(fileName, file));
                break;
            default:
                break;
        }
    } else {
        dispatch(changeFile(true));
    }
};

const uploadFileFilen = (fileName, file) => async (dispatch, getState) => {
    const state = getState();
    const token = state.auth.token;
    const filen = new FilenSDK({
        metadataCache: true, // Cache decrypted metadata in memory. Recommended.
        connectToSocket: false, // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
        ...token,
    });
    if (file.size > 0) {
        await filen.cloud().uploadWebFile({
            parent: state.file.uuid,
            file: new File([file], `${fileName}.csv`, {
                type: 'text/csv',
            }),
        });
    }
};

export const uploadFiles = () => (dispatch) => {
    dispatch({ type: FILE_PROGRESS });
    dispatch(uploadFile('Umsatz'));
    dispatch(uploadFile('wiederkehrenderUmsatz'));
    dispatch(uploadFile('Umbuchung'));
    dispatch(uploadFile('Abschluss'));
    dispatch(uploadFile('Kategorien'));
    dispatch(changeFile(false));
    dispatch(
        snackbarMessage('Der aktuelle Stand wurde erfolgreich gespeichert'),
    );
};

export const downloadFiles = () => (dispatch) => {
    dispatch({ type: FILE_PROGRESS });
    const zip = new JSZip();
    // create files
    zip.file('Umsatz.csv', dispatch(getFile('Umsatz')));
    zip.file(
        'wiederkehrenderUmsatz.csv',
        dispatch(getFile('wiederkehrenderUmsatz')),
    );
    zip.file('Umbuchung.csv', dispatch(getFile('Umbuchung')));
    zip.file('Abschluss.csv', dispatch(getFile('Abschluss')));
    zip.file('Kategorien.csv', dispatch(getFile('Kategorien')));
    // generate ZIP
    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(
            content,
            `haushalt_delucse__${moment().format('YYYY_MM_DD__HH_mm_ss')}.zip`,
        );
    });
    dispatch(changeFile(false));
    dispatch(
        snackbarMessage('Der aktuelle Stand wurde erfolgreich heruntergeladen'),
    );
};
