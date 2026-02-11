import { useDispatch } from 'react-redux';
import {
    alertErrorMessage,
    resetMessage,
    snackbarMessage,
} from '../actions/messageActions';

import DataFrame from 'dataframe-js';
import moment from 'moment';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { Box } from '@mui/material';
import Icon from '@mdi/react';
import { mdiFolderOpen } from '@mdi/js';

import Alert from './Alert';

const Migration = () => {
    const dispatch = useDispatch();

    const checkFileNames = (files) => {
        const validNames = [
            'Abschluss.csv',
            'Umbuchung.csv',
            'AusgabenKategorien.csv',
            'EinnahmenKategorien.csv',
            'Umsatz.csv',
            'wiederkehrenderUmsatz.csv',
        ];
        const validFiles = {};
        for (const file of files) {
            if (validNames.includes(file.name)) {
                validFiles[file.name] = file;
            }
        }
        return validFiles;
    };

    const openFolder = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.addEventListener('change', () => {
            if (input.files.length > 4) {
                const files = checkFileNames(input.files);
                if (
                    (Object.keys(files).length === 5 &&
                        !('wiederkehrenderUmsatz.csv' in files)) ||
                    Object.keys(files).length === 6
                ) {
                    migrateFiles(files);
                } else {
                    dispatch(
                        alertErrorMessage(
                            'Überprüfe den Inhalt des ausgewählten Ordners. Es müssen mindestens folgende .csv-Dateien enthalten sein: "Abschluss.csv", "Umbuchung.csv", "Umsatz.csv", "EinnahmenKategorien.csv", "AusgabenKategorien.csv".',
                            'migrationInput',
                        ),
                    );
                }
            } else {
                dispatch(
                    alertErrorMessage(
                        'Wähle einen Ordner mit mindestens vier .csv-Dateien aus.',
                        'migrationInput',
                    ),
                );
            }
        });
        input.addEventListener('cancel', () => {
            // nothing
        });
        if ('showPicker' in HTMLInputElement.prototype) {
            input.showPicker();
        } else {
            input.click();
        }
    };

    const migrateFiles = async (files) => {
        // Kategorien
        const kategorienEinnahmen = await DataFrame.fromText(
            files['EinnahmenKategorien.csv'],
            ';',
        );
        var kategorienAusgaben = await DataFrame.fromText(
            files['AusgabenKategorien.csv'],
            ';',
        );
        const kategorienAusgabenCollection = kategorienAusgaben.toCollection();
        const indistinctKategorien = {};
        kategorienEinnahmen.toCollection().forEach((kE) => {
            kategorienAusgabenCollection.forEach((kA) => {
                if (
                    kA['Oberkategorie'] === kE['Oberkategorie'] &&
                    kA['Unterkategorie'] === kE['Unterkategorie']
                ) {
                    indistinctKategorien[kE['ID']] = kA['ID'];
                }
            });
        });
        // distinct kategories
        Object.keys(indistinctKategorien).forEach((key) => {
            kategorienAusgaben = kategorienAusgaben.filter(
                (row) => row.get('ID') !== indistinctKategorien[key],
            );
        });
        var kategorien = kategorienEinnahmen.union(kategorienAusgaben);
        kategorien = kategorien.rename('ID', 'KategorieID');
        kategorien = kategorien.push(['2', 'nicht zugeordnet', '', 'variabel']);
        // Umsatz
        var umsatz = await DataFrame.fromText(files['Umsatz.csv'], ';');
        umsatz = umsatz.cast('Datum', (val) =>
            moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
        );
        umsatz = umsatz.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );
        Object.keys(indistinctKategorien).forEach((key) => {
            umsatz = umsatz.replace(indistinctKategorien[key], String(key), [
                'Kategorie',
            ]);
        });
        umsatz = umsatz.rename('Kategorie', 'KategorieID');
        umsatz = umsatz.join(kategorien, 'KategorieID', 'left');
        var abschluss = await DataFrame.fromText(files['Abschluss.csv'], ';');
        // Abschluss
        abschluss = abschluss.cast('Datum', (val) =>
            moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
        );
        abschluss = abschluss.cast(
            'Konto',
            (val) => val && Number(val.replace(',', '.')),
        );
        abschluss = abschluss.cast(
            'Bargeld',
            (val) => val && Number(val.replace(',', '.')),
        );
        // Umbuchung
        var umbuchung = await DataFrame.fromText(files['Umbuchung.csv'], ';');
        umbuchung = umbuchung.cast('Datum', (val) =>
            moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
        );
        umbuchung = umbuchung.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );
        // wiederkehrender Umsatz
        var wiederkehrenderUmsatz = new DataFrame(
            [],
            [
                'Tag',
                'Datum',
                'Betrag',
                'Art',
                'KategorieID',
                'Beschreibung',
                'Bemerkung',
            ],
        );
        if ('wiederkehrenderUmsatz.csv' in files) {
            wiederkehrenderUmsatz = await DataFrame.fromText(
                files['wiederkehrenderUmsatz.csv'],
                ';',
            );
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.withColumn(
                'Datum',
                () => '',
            );
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.cast(
                'Betrag',
                (val) => val && Number(val.replace(',', '.')),
            );
            Object.keys(indistinctKategorien).forEach((key) => {
                wiederkehrenderUmsatz = wiederkehrenderUmsatz.replace(
                    indistinctKategorien[key],
                    String(key),
                    ['KategorieID'],
                );
            });
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.join(
                kategorien,
                'KategorieID',
                'left',
            );
        }
        const zip = new JSZip();
        // create files
        zip.file('Umsatz.csv', getFile('Umsatz', umsatz));
        zip.file(
            'wiederkehrenderUmsatz.csv',
            getFile('wiederkehrenderUmsatz', wiederkehrenderUmsatz),
        );
        zip.file('Umbuchung.csv', getFile('Umbuchung', umbuchung));
        zip.file('Abschluss.csv', getFile('Abschluss', abschluss));
        zip.file('Kategorien.csv', getFile('Kategorien', kategorien));
        // generate ZIP
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(
                content,
                `haushalt_delucse__${moment().format('YYYY_MM_DD__HH_mm_ss')}.zip`,
            );
        });
        dispatch(
            snackbarMessage(
                'Der aktuelle Stand von Excel wurde erfolgreich migriert.',
            ),
        );
    };

    const getFile = (fileName, dataframe) => {
        var fileContent = '';
        switch (fileName) {
            case 'Kategorien':
                fileContent = dataframe
                    .filter((row) => row.get('KategorieID') > 2)
                    .select('KategorieID', 'Oberkategorie', 'Unterkategorie')
                    .rename('KategorieID', 'ID')
                    .toText(';');
                break;
            case 'Umsatz':
                fileContent = dataframe
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
                fileContent = dataframe
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
                fileContent = dataframe
                    .select('Datum', 'Konto', 'Bargeld')
                    .toText(';');
                break;
            case 'Umbuchung':
                fileContent = dataframe
                    .select('Datum', 'Betrag', 'Bemerkung')
                    .toText(';');
                break;
            default:
                break;
        }
        if (!fileContent.includes('\n')) {
            fileContent += '\n\r';
        }
        return new Blob([fileContent], { type: 'text/csv' });
    };

    return (
        <>
            Du hast bereits in der Vergangenheit die Excel-Anwendung "Haushalt
            Delucse" verwendet und möchtest nun aufbauend auf deinen bisherigen
            Eintragungen weitermachen? Kein Problem. Nachfolgend kannst du über
            die Schaltfläche "Daten migrieren" deinen Ordner mit den
            .csv-Dateien auswählen, die im Anschluss an die neuen
            Voraussetzungen angepasst und als .zip-Ordner heruntergeladen
            werden. Solltest du noch kein Backup deiner Daten in der
            Excel-Anwendung exportiert haben, so öffne zuerst die
            Excel-Anwendung und erstelle dir ein aktuelles Backup unter
            "Einstellungen" {'>'} "Daten exportieren".
            <Alert
                type={['migrationInput']}
                style={{ marginBottom: '10px', marginTop: '10px' }}
            />
            <Box
                id="migrationInput"
                sx={{
                    marginTop: '10px',
                    background: (theme) => theme.palette.background.default,
                    height: '60px',
                    width: '180px',
                    color: (theme) => theme.palette.primary.main,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.primary.light,
                    '&:hover': {
                        background: (theme) => theme.palette.primary.light,
                        color: (theme) => theme.palette.background.default,
                        borderColor: (theme) => theme.palette.primary.main,
                    },
                }}
                onClick={() => {
                    dispatch(resetMessage());
                    openFolder();
                }}
            >
                <Icon
                    path={mdiFolderOpen}
                    size={1.4}
                    style={{ marginRight: '5px' }}
                />{' '}
                Daten migrieren
            </Box>
        </>
    );
};

export default Migration;
