import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
    addUmsatz,
    changeUmsatz,
    deleteUmsatz,
} from '../actions/dataframeActions/umsatzActions';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';

import { Link } from 'react-router-dom';

import moment from 'moment';

import { useDialogs } from '@toolpad/core/useDialogs';
import { Stack } from '@mui/material';

import Button from './Button';
import Textfield from './Textfield';
import Numberfield from './Numberfield';
import Datefield from './Datefield';
import Autocomplete from './Autocomplete';
import Alert from './Alert';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import {
    addWiederkehrenderUmsatz,
    changeWiederkehrenderUmsatz,
    deleteWiederkehrenderUmsatz,
} from '../actions/dataframeActions/wiederkehrenderUmsatz';

const AddUmsatz = ({
    open,
    id,
    timestamp,
    art,
    betrag,
    typ,
    kategorie,
    beschreibung,
    bemerkung,
    tags,
    wid = null,
    onClose,
}) => {
    const dialogs = useDialogs();

    const dispatch = useDispatch();
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien,
    )
        ?.filter((row) => row.get('KategorieID') > 2)
        .toCollection();

    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newArt, setNewArt] = useState(art);
    const [newBetrag, setNewBetrag] = useState(betrag);
    const [betragError, setBetragError] = useState(false);
    const [newTyp, setNewTyp] = useState(typ);
    const [newKategorie, setNewKategorie] = useState(kategorie);
    const [newBeschreibung, setNewBeschreibung] = useState(beschreibung);
    const [newBemerkung, setNewBemerkung] = useState(bemerkung);
    const [newTags, setNewTags] = useState(tags);

    const submit = async () => {
        if (newBetrag === undefined || newBetrag === '') {
            dispatch(
                alertErrorMessage(
                    'Die Angabe des Betrages ist verpflichtend.',
                    'umsatzBetrag',
                ),
            );
        } else if (betragError) {
            dispatch(
                alertErrorMessage(
                    'Betrag: Ungültige Zahl bzw. arithmetischer Ausdruck.',
                    'umsatzBetrag',
                ),
            );
        } else if (newBetrag === 0) {
            dispatch(
                alertErrorMessage(
                    'Der Betrag darf nicht 0,00 € betragen.',
                    'umsatzBetrag',
                ),
            );
        } else if (!newKategorie) {
            dispatch(
                alertErrorMessage(
                    'Es muss eine Kategorie ausgewählt werden.',
                    'umsatzKategorie',
                ),
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
                    newTyp !== typ ||
                    newKategorie.KategorieID !== kategorie ||
                    newBeschreibung !== beschreibung ||
                    newBemerkung !== bemerkung ||
                    newTags.toString() !== tags.toString()
                ) {
                    if (newTyp === 'fix' && newTyp !== typ) {
                        const confirmed = await dialogs.open(ConfirmDialog, {
                            title: 'wiederkehrenden Umsatz hinzufügen',
                            message:
                                'Soll ein entsprechender wiederkehrender Umsatz hinzugefügt werden?',
                        });
                        if (confirmed) {
                            wid = dispatch(
                                addWiederkehrenderUmsatz(
                                    moment(calcTimestamp).date(),
                                    newArt,
                                    newBetrag,
                                    newKategorie.KategorieID,
                                    newBeschreibung,
                                    newBemerkung,
                                    newTags,
                                    calcTimestamp,
                                ),
                            );
                        }
                    } else if (typ === 'fix' && wid) {
                        if (newTyp !== 'fix') {
                            wid = null;
                            const confirmed = await dialogs.open(
                                ConfirmDialog,
                                {
                                    title: 'wiederkehrenden Umsatz löschen',
                                    message:
                                        'Soll der aktuell verknüpfte wiederkehrende Umsatz gelöscht werden?',
                                },
                            );
                            if (confirmed) {
                                dispatch(
                                    deleteWiederkehrenderUmsatz(wid, false),
                                );
                            }
                        } else {
                            const confirmed = await dialogs.open(
                                ConfirmDialog,
                                {
                                    title: 'wiederkehrenden Umsatz anpassen',
                                    message:
                                        'Soll der aktuell verknüpfte wiederkehrende Umsatz angepasst werden?',
                                },
                            );
                            if (confirmed) {
                                dispatch(
                                    changeWiederkehrenderUmsatz(wid, {
                                        zeitstempel: calcTimestamp,
                                        art: newArt,
                                        betrag: newBetrag,
                                        kategorie: newKategorie.KategorieID,
                                        beschreibung: newBeschreibung,
                                        bemerkung: newBemerkung,
                                        tags: newTags,
                                    }),
                                );
                            } else {
                                wid = null;
                            }
                        }
                    }
                    dispatch(
                        changeUmsatz(id, {
                            zeitstempel: calcTimestamp,
                            art: newArt,
                            betrag: newBetrag,
                            typ: newTyp,
                            kategorie: newKategorie.KategorieID,
                            beschreibung: newBeschreibung,
                            bemerkung: newBemerkung,
                            tags: newTags,
                            wid,
                        }),
                    );
                }
            } else {
                if (newTyp === 'fix') {
                    const confirmed = await dialogs.open(ConfirmDialog, {
                        title: 'wiederkehrenden Umsatz hinzufügen',
                        message:
                            'Soll ein entsprechender wiederkehrender Umsatz hinzugefügt werden?',
                    });
                    if (confirmed) {
                        wid = dispatch(
                            addWiederkehrenderUmsatz(
                                moment(calcTimestamp).date(),
                                newArt,
                                newBetrag,
                                newKategorie.KategorieID,
                                newBeschreibung,
                                newBemerkung,
                                newTags,
                                calcTimestamp,
                            ),
                        );
                    }
                }
                dispatch(
                    addUmsatz(
                        calcTimestamp,
                        newBetrag,
                        newArt,
                        newTyp,
                        newKategorie.KategorieID,
                        newBeschreibung,
                        newBemerkung,
                        newTags,
                        wid,
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
        setNewTimestamp();
        setNewArt('Ausgabe');
        setNewBetrag('');
        setNewTyp('variabel');
        setNewKategorie('');
        setNewBeschreibung('');
        setNewBemerkung('');
        setNewTags([]);
        setBetragError(false);
    };

    useEffect(() => {
        setNewTimestamp(timestamp);
        setNewArt(art);
        setNewBetrag(betrag);
        setNewTyp(typ);
        setNewKategorie(
            kategorien &&
                kategorien.filter((k) => k.KategorieID === kategorie)[0],
        );
        setNewBeschreibung(beschreibung);
        setNewBemerkung(bemerkung);
        setNewTags(tags);
        // eslint-disable-next-line
    }, [id]);

    return (
        kategorien && (
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
                            <Stack
                                direction={'row'}
                                spacing={'20px'}
                                sx={{
                                    display: 'flex',
                                }}
                            >
                                <Autocomplete
                                    select
                                    value={newArt}
                                    placeholder={'Art'}
                                    options={['Einnahme', 'Ausgabe']}
                                    fullWidth
                                    onChange={(value) => {
                                        setNewArt(value);
                                    }}
                                />
                            </Stack>
                            <Stack
                                direction={'row'}
                                spacing={'20px'}
                                sx={{
                                    display: 'flex',
                                    marginTop: '20px',
                                }}
                            >
                                <Datefield
                                    value={newTimestamp}
                                    onChange={(newValue) =>
                                        setNewTimestamp(
                                            newValue.startOf('day').valueOf(),
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
                                    value={newTyp}
                                    placeholder={'Typ'}
                                    options={['fix', 'variabel']}
                                    fullWidth
                                    onChange={(value) => {
                                        setNewTyp(value);
                                    }}
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
                                style={{ marginBottom: '20px' }}
                                placeholder={'Bemerkung'}
                                value={newBemerkung}
                                onChange={(e) => {
                                    setNewBemerkung(e.target.value);
                                }}
                            />
                            <Autocomplete
                                value={newTags}
                                options={[]}
                                placeholder={'Tags'}
                                fullWidth
                                multiple
                                freeSolo
                                onChange={(value) => {
                                    setNewTags(value);
                                }}
                                style={{ marginBottom: '4px' }}
                            />
                        </div>
                    ) : (
                        <Alert
                            message={
                                <div>
                                    Ein Umsatz muss immer mit einer Kategorie
                                    verknüpft sein. Bevor also ein Umsatz
                                    hinzugefügt werden kann, muss zunächst mind.
                                    eine Kategorie{' '}
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
                        <>
                            {id && (
                                <Button
                                    onClick={async () => {
                                        const confirmed = await dialogs.open(
                                            ConfirmDialog,
                                            {
                                                title: 'Umsatz löschen',
                                                message:
                                                    'Möchtest du wirklich deinen Umsatz löschen?',
                                                yes: 'Bestätigen',
                                                no: 'Abbrechen',
                                            },
                                        );
                                        if (confirmed) {
                                            if (typ === 'fix' && wid) {
                                                const confirmedWiederkehrend =
                                                    await dialogs.open(
                                                        ConfirmDialog,
                                                        {
                                                            title: 'wiederkehrenden Umsatz löschen',
                                                            message:
                                                                'Soll auch der entsprechend verknüpfte wiederkehrende Umsatz gelöscht werden?',
                                                        },
                                                    );
                                                if (confirmedWiederkehrend) {
                                                    dispatch(
                                                        deleteWiederkehrenderUmsatz(
                                                            wid,
                                                            false,
                                                        ),
                                                    );
                                                }
                                            }
                                            dispatch(
                                                deleteUmsatz(id, timestamp),
                                            );
                                            onClose();
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    Löschen
                                </Button>
                            )}
                            <Button onClick={submit} variant="contained">
                                Bestätigen
                            </Button>
                        </>
                    )
                }
            />
        )
    );
};

export default AddUmsatz;
