import { useDispatch } from 'react-redux';
import {
    alertErrorMessage,
    resetMessage,
    snackbarMessage,
} from '../actions/messageActions';
import {
    calcDate,
    calcFeiertage,
} from '../actions/dataframeActions/wiederkehrenderUmsatz';

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

    const calcMonatspostenDate = (wiederkehrenderUmsatz, umsatz) => {
        const count = wiederkehrenderUmsatz.count();
        if (count > 0 && umsatz.count() > 0) {
            const lastUmsatz = moment(umsatz.stat.max('Zeitstempel'));
            const jahr = lastUmsatz.year();
            const monat = lastUmsatz.month() + 1;
            const feiertage = calcFeiertage(jahr, monat);
            var index = 0;
            while (index < count) {
                const row = wiederkehrenderUmsatz.getRow(index);
                const datum = calcDate(jahr, monat, row.get('Tag'), feiertage);
                wiederkehrenderUmsatz = wiederkehrenderUmsatz.setRow(
                    index,
                    (row) => {
                        row = row.set('Datum', datum.format('DD.MM.YYYY'));
                        return row;
                    },
                );
                index++;
            }
        }
        return wiederkehrenderUmsatz;
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
        var kategorien = kategorienEinnahmen.union(kategorienAusgaben);
        kategorien = kategorien.rename('ID', 'KategorieID');
        kategorien = kategorien.push(['2', 'nicht zugeordnet', '', 'variabel']);
        // Umsatz
        var umsatz = await DataFrame.fromText(files['Umsatz.csv'], ';');
        umsatz = umsatz.cast('Datum', (val) =>
            moment(Date.UTC(0, 0, val - 1)).format('DD.MM.YYYY'),
        );
        umsatz = umsatz.withColumn('Zeitstempel', (row) =>
            moment(row.get('Datum'), 'DD.MM.YYYY', true).valueOf(),
        );
        umsatz = umsatz.cast(
            'Betrag',
            (val) => val && Number(val.replace(',', '.')),
        );
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
            wiederkehrenderUmsatz = calcMonatspostenDate(
                wiederkehrenderUmsatz,
                umsatz,
            );
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.cast(
                'Betrag',
                (val) => val && Number(val.replace(',', '.')),
            );
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.join(
                kategorien,
                'KategorieID',
                'left',
            );
        }

        // distinct kategories
        Object.keys(indistinctKategorien).forEach((key) => {
            kategorien = kategorien.filter(
                (row) => row.get('KategorieID') !== indistinctKategorien[key],
            );
            umsatz = umsatz.replace(indistinctKategorien[key], String(key), [
                'KategorieID',
            ]);
            wiederkehrenderUmsatz = wiederkehrenderUmsatz.replace(
                indistinctKategorien[key],
                String(key),
                ['KategorieID'],
            );
        });
        // restructure kategorieID
        kategorien = kategorien
            .withColumn('ID', (r) => Number(r.get('KategorieID')))
            .filter((r) => r.get('ID') > 2)
            .sortBy('ID');
        var id = 3;
        kategorien.toCollection().forEach((kategorie) => {
            if (kategorie['ID'] !== id) {
                const kategorienKategorieID = kategorien.chain(
                    (row) =>
                        row.get('KategorieID') === kategorie['KategorieID'],
                    (row) => row.set('KategorieID', id),
                );
                kategorien = kategorien
                    .filter(
                        (row) =>
                            row.get('KategorieID') !== kategorie['KategorieID'],
                    )
                    .union(kategorienKategorieID);
                const umsatzKategorieID = umsatz.chain(
                    (row) =>
                        row.get('KategorieID') === kategorie['KategorieID'],
                    (row) => row.set('KategorieID', id),
                );
                umsatz = umsatz
                    .filter(
                        (row) =>
                            row.get('KategorieID') !== kategorie['KategorieID'],
                    )
                    .union(umsatzKategorieID);
                const wiederkehrenderUmsatzKategorieID =
                    wiederkehrenderUmsatz.chain(
                        (row) =>
                            row.get('KategorieID') === kategorie['KategorieID'],
                        (row) => row.set('KategorieID', id),
                    );
                wiederkehrenderUmsatz = wiederkehrenderUmsatz
                    .filter(
                        (row) =>
                            row.get('KategorieID') !== kategorie['KategorieID'],
                    )
                    .union(wiederkehrenderUmsatzKategorieID);
            }
            id++;
        });

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
                    .select('KategorieID', 'Oberkategorie', 'Unterkategorie')
                    .rename('KategorieID', 'ID')
                    .toText(';');
                break;
            case 'Umsatz':
                fileContent = dataframe
                    .filter((row) => row.get('KategorieID') > 1)
                    .withColumn('Tags', () => '')
                    .select(
                        'Datum',
                        'Betrag',
                        'Art',
                        'Typ',
                        'KategorieID',
                        'Beschreibung',
                        'Bemerkung',
                        'Tags',
                    )
                    .rename('KategorieID', 'Kategorie')
                    .toText(';');
                break;
            case 'wiederkehrenderUmsatz':
                fileContent = dataframe
                    .withColumn('Tags', () => '')
                    .select(
                        'Tag',
                        'Betrag',
                        'Art',
                        'KategorieID',
                        'Beschreibung',
                        'Bemerkung',
                        'Tags',
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
