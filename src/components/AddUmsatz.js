import { useDispatch, useSelector } from 'react-redux';
import Button from './Button';
import Dialog from './Dialog';
import {
    addUmsatz,
    changeUmsatz,
    deleteUmsatz,
} from '../actions/datafraneActions';
import { useEffect, useState } from 'react';
import Textfield from './Textfield';
import Numberfield from './Numberfield';
import Alert from './Alert';
import Datefield from './Datefield';
import { FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';
import Autocomplete from './Autocomplete';
import { Link } from 'react-router-dom';
import moment from 'moment';

const AddUmsatz = ({
    open,
    id,
    timestamp,
    art,
    betrag,
    kategorie,
    beschreibung,
    bemerkung,
    onClose,
}) => {
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien
    )
        ?.filter((row) => row.get('KategorieID') > 2)
        .toCollection();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newArt, setNewArt] = useState(art);
    const [newBetrag, setNewBetrag] = useState(betrag);
    const [betragError, setBetragError] = useState(false);
    const [newKategorie, setNewKategorie] = useState(kategorie);
    const [newBeschreibung, setNewBeschreibung] = useState(beschreibung);
    const [newBemerkung, setNewBemerkung] = useState(bemerkung);
    const dispatch = useDispatch();

    const submit = () => {
        if (newBetrag === undefined || newBetrag === '') {
            dispatch(
                alertErrorMessage(
                    'Die Angabe des Betrages ist verpflichtend.',
                    'umsatzBetrag'
                )
            );
        } else if (betragError) {
            dispatch(
                alertErrorMessage(
                    'Betrag: Ungültige Zahl bzw. arithmetischer Ausdruck.',
                    'umsatzBetrag'
                )
            );
        } else if (newBetrag === 0) {
            dispatch(
                alertErrorMessage(
                    'Der Betrag darf nicht 0,00 € betragen.',
                    'umsatzBetrag'
                )
            );
        } else if (!newKategorie) {
            dispatch(
                alertErrorMessage(
                    'Es muss eine Kategorie ausgewählt werden.',
                    'umsatzKategorie'
                )
            );
        } else {
            var calcTimestamp = newTimestamp;
            if (!newTimestamp)
                calcTimestamp = moment().startOf('day').valueOf();
            if (id) {
                if (
                    calcTimestamp !== timestamp ||
                    newArt !== art ||
                    newBetrag !== betrag ||
                    newKategorie.KategorieID !== kategorie ||
                    newBeschreibung !== beschreibung ||
                    newBemerkung !== bemerkung
                ) {
                    dispatch(
                        changeUmsatz(
                            id,
                            {
                                timestamp: calcTimestamp,
                                art: newArt,
                                betrag: newBetrag,
                                kategorie: newKategorie.KategorieID,
                                beschreibung: newBeschreibung,
                                bemerkung: newBemerkung,
                            },
                            {
                                timestamp,
                                art,
                                betrag,
                                kategorie,
                                beschreibung,
                                bemerkung,
                            }
                        )
                    );
                }
            } else {
                dispatch(
                    addUmsatz(
                        calcTimestamp,
                        newArt,
                        newBetrag,
                        newKategorie.KategorieID,
                        newBeschreibung,
                        newBemerkung
                    )
                );
            }
            close();
        }
    };

    const closeDialog = () => {
        close();
        dispatch(resetMessage());
    };

    const close = () => {
        onClose();
        setNewTimestamp();
        setNewArt('Ausgabe');
        setNewBetrag('');
        setNewKategorie('');
        setNewBeschreibung('');
        setNewBemerkung('');
        setBetragError(false);
    };

    useEffect(() => {
        setNewTimestamp(timestamp);
        setNewArt(art);
        setNewBetrag(betrag);
        setNewKategorie(
            kategorien &&
                kategorien.filter((k) => k.KategorieID === kategorie)[0]
        );
        setNewBeschreibung(beschreibung);
        setNewBemerkung(bemerkung);
        // eslint-disable-next-line
    }, [id]);

    return (
        kategorien && (
            <>
                <Dialog
                    open={open}
                    onClose={closeDialog}
                    closeIcon={true}
                    title={id ? 'Umsatz verändern' : 'Umsatz hinzufügen'}
                    fullWidth
                    content={
                        kategorien.length > 0 ? (
                            <div>
                                <Alert
                                    type={['umsatzBetrag', 'umsatzKategorie']}
                                    style={{ marginBottom: '20px' }}
                                />
                                <RadioGroup
                                    value={newArt}
                                    onChange={(e) => setNewArt(e.target.value)}
                                    row
                                >
                                    <FormControlLabel
                                        value="Einnahme"
                                        control={<Radio />}
                                        sx={{ marginRight: 0 }}
                                        label="Einnahme"
                                    />
                                    <FormControlLabel
                                        value="Ausgabe"
                                        control={
                                            <Radio
                                                sx={{ marginLeft: '20px' }}
                                            />
                                        }
                                        sx={{ marginRight: 0 }}
                                        label="Ausgabe"
                                    />
                                </RadioGroup>
                                <Stack
                                    direction={'row'}
                                    spacing={'20px'}
                                    sx={{
                                        display: 'flex',
                                        marginTop: '10px',
                                    }}
                                >
                                    <Datefield
                                        value={newTimestamp}
                                        onChange={(newValue) =>
                                            setNewTimestamp(
                                                newValue
                                                    .startOf('day')
                                                    .valueOf()
                                            )
                                        }
                                        toolbarFormat={'DD. MMMM'}
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                    <Numberfield
                                        margin
                                        autoFocus
                                        placeholder={'Betrag'}
                                        value={newBetrag}
                                        onChange={(val) => {
                                            setNewBetrag(val);
                                            dispatch(resetMessage());
                                        }}
                                        onError={(val) => setBetragError(val)}
                                        end="€"
                                    />
                                </Stack>
                                <Autocomplete
                                    value={newKategorie}
                                    placeholder={'Kategorie'}
                                    options={kategorien}
                                    optionLabel={'Kategorie'}
                                    fullWidth
                                    onChange={(value) => {
                                        setNewKategorie(value);
                                    }}
                                    style={{ marginBottom: '20px' }}
                                />
                                {/* <Textfield
                                style={{ marginBottom: '20px' }}
                                placeholder={'Kategorie'}
                                value={newKategorie}
                            /> */}
                                <Textfield
                                    style={{ marginBottom: '20px' }}
                                    placeholder={'Beschreibung'}
                                    value={newBeschreibung}
                                    onChange={(e) => {
                                        setNewBeschreibung(e.target.value);
                                    }}
                                />
                                <Textfield
                                    style={{ marginBottom: '4px' }}
                                    placeholder={'Bemerkung'}
                                    value={newBemerkung}
                                    onChange={(e) => {
                                        setNewBemerkung(e.target.value);
                                    }}
                                />
                            </div>
                        ) : (
                            <Alert
                                message={
                                    <div>
                                        Ein Umsatz muss immer mit einer
                                        Kategorie verknüpft sein. Bevor also ein
                                        Umsatz hinzugefügt werden kann, muss
                                        zunächst mind. eine Kategorie{' '}
                                        <Link
                                            to="/kategorien"
                                            style={{ color: 'inherit' }}
                                            onClick={onClose}
                                        >
                                            hier
                                        </Link>{' '}
                                        erstellt werden.
                                    </div>
                                }
                                severity="info"
                            />
                        )
                    }
                    actions={
                        kategorien.length > 0 && (
                            <div>
                                {id && (
                                    <Button
                                        onClick={() => setDeleteOpen(true)}
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                    >
                                        Löschen
                                    </Button>
                                )}
                                <Button
                                    // disabled={error}
                                    onClick={submit}
                                    variant="contained"
                                >
                                    Bestätigen
                                </Button>
                            </div>
                        )
                    }
                />
                {id && (
                    <Dialog
                        open={deleteOpen}
                        title={'Umsatz löschen'}
                        content={'Möchtest du wirklich deinen Umsatz löschen?'}
                        actions={
                            <div>
                                <Button
                                    onClick={() => setDeleteOpen(false)}
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                >
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={() => {
                                        dispatch(deleteUmsatz(id, timestamp));
                                        onClose();
                                        setDeleteOpen(false);
                                    }}
                                    variant="contained"
                                >
                                    Bestätigen
                                </Button>
                            </div>
                        }
                    />
                )}
            </>
        )
    );
};

export default AddUmsatz;
