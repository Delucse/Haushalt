import { useDispatch, useSelector } from 'react-redux';
import Button from './Button';
import Dialog from './Dialog';
import {
    addWiederkehrenderUmsatz,
    changeWiederkehrenderUmsatz,
    deleteWiederkehrenderUmsatz,
} from '../actions/dataframeActions/wiederkehrenderUmsatz';
import { useEffect, useState } from 'react';
import Textfield from './Textfield';
import Numberfield from './Numberfield';
import Alert from './Alert';
import { Stack } from '@mui/material';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';
import Autocomplete from './Autocomplete';
import { Link } from 'react-router-dom';

const AddWiederkehrenderUmsatz = ({
    open,
    id,
    tag,
    art,
    betrag,
    kategorie,
    beschreibung,
    bemerkung,
    onClose,
}) => {
    const errorType = useSelector((state) =>
        state.message.error ? state.message.type : '',
    );
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien,
    )
        ?.filter((row) => row.get('KategorieID') > 2)
        .toCollection();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newTag, setNewTag] = useState(tag);
    const [newArt, setNewArt] = useState(art);
    const [newBetrag, setNewBetrag] = useState(betrag);
    const [betragError, setBetragError] = useState(false);
    const [newKategorie, setNewKategorie] = useState(kategorie);
    const [newBeschreibung, setNewBeschreibung] = useState(beschreibung);
    const [newBemerkung, setNewBemerkung] = useState(bemerkung);

    const dispatch = useDispatch();

    const submit = () => {
        if (
            !newTag ||
            newTag < 1 ||
            newTag > 31 ||
            parseInt(newTag) !== Number(newTag)
        ) {
            dispatch(
                alertErrorMessage(
                    'Der Tag muss mindestens 1 und darf nicht größer 31 sein (ganzzahlig).',
                    'wiederkehrenderUmsatzTag',
                ),
            );
        } else if (newBetrag === undefined || newBetrag === '') {
            dispatch(
                alertErrorMessage(
                    'Die Angabe des Betrages ist verpflichtend.',
                    'wiederkehrenderUmsatzBetrag',
                ),
            );
        } else if (betragError) {
            dispatch(
                alertErrorMessage(
                    'Betrag: Ungültige Zahl bzw. arithmetischer Ausdruck.',
                    'wiederkehrenderUmsatzBetrag',
                ),
            );
        } else if (newBetrag === 0) {
            dispatch(
                alertErrorMessage(
                    'Der Betrag darf nicht 0,00 € betragen.',
                    'wiederkehrenderUmsatzBetrag',
                ),
            );
        } else if (!newKategorie?.KategorieID) {
            dispatch(
                alertErrorMessage(
                    'Es muss eine Kategorie ausgewählt werden.',
                    'wiederkehrenderUmsatzKategorie',
                ),
            );
        } else {
            if (id) {
                if (
                    newTag !== tag ||
                    newArt !== art ||
                    newBetrag !== betrag ||
                    newKategorie.KategorieID !== kategorie ||
                    newBeschreibung !== beschreibung ||
                    newBemerkung !== bemerkung
                ) {
                    dispatch(
                        changeWiederkehrenderUmsatz(
                            id,
                            {
                                tag: newTag,
                                art: newArt,
                                betrag: newBetrag,
                                kategorie: newKategorie.KategorieID,
                                beschreibung: newBeschreibung,
                                bemerkung: newBemerkung,
                            },
                            {
                                tag,
                                art,
                                betrag,
                                kategorie,
                                beschreibung,
                                bemerkung,
                            },
                        ),
                    );
                }
            } else {
                dispatch(
                    addWiederkehrenderUmsatz(
                        newTag,
                        newArt,
                        newBetrag,
                        newKategorie.KategorieID,
                        newBeschreibung,
                        newBemerkung,
                    ),
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
        setNewTag('');
        setNewArt('Ausgabe');
        setNewBetrag('');
        setNewKategorie('');
        setNewBeschreibung('');
        setNewBemerkung('');
        setBetragError(false);
    };

    useEffect(() => {
        setNewTag(tag);
        setNewArt(art);
        setNewBetrag(betrag);
        setNewKategorie(
            kategorien &&
                kategorien.filter((k) => k.KategorieID === kategorie)[0],
        );
        setNewBeschreibung(beschreibung);
        setNewBemerkung(bemerkung);
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (errorType === 'wiederkehrenderUmsatzTag') {
            dispatch(resetMessage());
        }
        return () => {
            if (errorType === 'wiederkehrenderUmsatzTag') {
                dispatch(resetMessage());
            }
        };
        // eslint-disable-next-line
    }, [newTag]);

    useEffect(() => {
        if (errorType === 'wiederkehrenderUmsatzKategorie') {
            dispatch(resetMessage());
        }
        return () => {
            if (errorType === 'wiederkehrenderUmsatzKategorie') {
                dispatch(resetMessage());
            }
        };
        // eslint-disable-next-line
    }, [newKategorie]);

    return (
        kategorien && (
            <>
                <Dialog
                    open={open}
                    onClose={closeDialog}
                    closeIcon={true}
                    title={
                        id
                            ? 'wiederkehrenden Umsatz verändern'
                            : 'wiederkehrenden Umsatz hinzufügen'
                    }
                    fullWidth
                    content={
                        kategorien.length > 0 ? (
                            <div>
                                <Alert
                                    message={
                                        id
                                            ? 'Die Änderungen des wiederkehrenden Umsatzes werden erst ab dem nächsten Monat wirksam.'
                                            : 'Der neue wiederkehrende Umsatz wird erst ab dem nächsten Monat wirksam.'
                                    }
                                    severity="info"
                                    style={{ marginBottom: '20px' }}
                                />
                                <Alert
                                    type={[
                                        'wiederkehrenderUmsatzBetrag',
                                        'wiederkehrenderUmsatzKategorie',
                                        'wiederkehrenderUmsatzTag',
                                    ]}
                                    style={{ marginBottom: '20px' }}
                                />

                                <Autocomplete
                                    value={newArt}
                                    placeholder={'Art'}
                                    options={['Einnahme', 'Ausgabe']}
                                    fullWidth
                                    onChange={(value) => {
                                        setNewArt(value);
                                    }}
                                />
                                <Stack
                                    direction={'row'}
                                    spacing={'20px'}
                                    sx={{
                                        display: 'flex',
                                        marginTop: '20px',
                                    }}
                                >
                                    <Textfield
                                        autoFocus
                                        type="number"
                                        inputProps={{ min: 1, max: 31 }}
                                        style={{ marginBottom: '20px' }}
                                        placeholder={'Tag'}
                                        value={newTag}
                                        onChange={(e) => {
                                            setNewTag(e.target.value);
                                        }}
                                    />
                                    <Numberfield
                                        margin
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
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={'20px'}
                                    sx={{
                                        display: 'flex',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <Autocomplete
                                        select
                                        value={'fix'}
                                        placeholder={'Typ'}
                                        options={['fix', 'variabel']}
                                        disabled
                                        fullWidth
                                        style={{
                                            width: {
                                                xs: '100%',
                                                sm: '40%',
                                            },
                                        }}
                                    />
                                    <Autocomplete
                                        value={newKategorie}
                                        placeholder={'Kategorie'}
                                        options={kategorien}
                                        optionLabel={'Kategorie'}
                                        fullWidth
                                        onChange={(value) => {
                                            setNewKategorie(value);
                                        }}
                                    />
                                </Stack>
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
                                        Ein wiederkehrender Umsatz muss immer
                                        mit einer Kategorie verknüpft sein.
                                        Bevor also ein Umsatz hinzugefügt werden
                                        kann, muss zunächst mind. eine Kategorie{' '}
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
                        title={'wiederkehrenden Umsatz löschen'}
                        content={
                            <>
                                <Alert
                                    message={
                                        'Die Nicht-Berücksichtigung des gelöschten wiederkehrenden Umsatzes wird erst ab dem nächsten Monat wirksam.'
                                    }
                                    severity="info"
                                    style={{ marginBottom: '16px' }}
                                />
                                Möchtest du wirklich deinen wiederkehrenden
                                Umsatz löschen?
                            </>
                        }
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
                                        dispatch(
                                            deleteWiederkehrenderUmsatz(id),
                                        );
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

export default AddWiederkehrenderUmsatz;
