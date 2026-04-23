import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
    addAbschluss,
    changeAbschluss,
    deleteAbschluss,
} from '../actions/dataframeActions/abschlussActions';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';

import moment from 'moment';

import { useDialogs } from '@toolpad/core/useDialogs';
import { Stack } from '@mui/material';

import Button from './Button';
import Numberfield from './Numberfield';
import Datefield from './Datefield';
import Alert from './Alert';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';

const AddAbschluss = ({ open, id, timestamp, konto, bargeld, onClose }) => {
    const dialogs = useDialogs();

    const dispatch = useDispatch();
    const abschluss = useSelector(
        (state) => state.dataframe.original.abschluss,
    );

    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newKonto, setNewKonto] = useState(konto);
    const [kontoError, setKontoError] = useState(false);
    const [newBargeld, setNewBargeld] = useState(bargeld);
    const [bargeldError, setBargeldError] = useState(false);

    const submit = () => {
        var calcTimestamp = newTimestamp;
        if (!newTimestamp) calcTimestamp = moment().startOf('day').valueOf();
        const existOtherAbschluss = abschluss.find((row) => {
            if (id) {
                return (
                    row.get('Zeitstempel') === calcTimestamp &&
                    row.get('ID') !== id
                );
            }
            return row.get('Zeitstempel') === calcTimestamp;
        });
        if (!existOtherAbschluss) {
            if (
                newKonto !== undefined &&
                newKonto !== '' &&
                newBargeld !== undefined &&
                newBargeld !== ''
            ) {
                if (!kontoError && !bargeldError) {
                    if (id) {
                        if (
                            calcTimestamp !== timestamp ||
                            newKonto !== konto ||
                            newBargeld !== bargeld
                        ) {
                            dispatch(
                                changeAbschluss(
                                    id,
                                    {
                                        timestamp: calcTimestamp,
                                        konto: newKonto,
                                        bargeld: newBargeld,
                                    },
                                    {
                                        timestamp,
                                        konto,
                                        bargeld,
                                    },
                                ),
                            );
                        }
                    } else {
                        dispatch(
                            addAbschluss(
                                calcTimestamp, // ? newTimestamp : new Date(),
                                newKonto,
                                newBargeld,
                            ),
                        );
                    }
                    close();
                } else {
                    dispatch(
                        alertErrorMessage(
                            `${
                                kontoError ? 'Konto: ' : 'Bargeld: '
                            }Ungültige Zahl bzw. arithmetischer Ausdruck.`,
                            'abschlussKontoBargeld',
                        ),
                    );
                }
            } else {
                dispatch(
                    alertErrorMessage(
                        'Die Angabe des Kontostandes und des Bargeldbestandes sind verpflichtend.',
                        'abschlussBetrag',
                    ),
                );
            }
        } else {
            dispatch(
                alertErrorMessage(
                    'Das gewählte Datum existiert bereits - aktualisiere bitte den entsprechenden Eintrag.',
                    'abschlussZeitstempel',
                ),
            );
        }
    };

    const closeDialog = () => {
        close();
        dispatch(resetMessage());
    };

    const close = () => {
        onClose();
        setNewTimestamp();
        setNewKonto('');
        setNewBargeld('');
        setBargeldError(false);
        setKontoError(false);
    };

    useEffect(() => {
        setNewTimestamp(timestamp);
        setNewKonto(konto);
        setNewBargeld(bargeld);
        // eslint-disable-next-line
    }, [id]);

    return (
        <Dialog
            open={open}
            onClose={closeDialog}
            closeIcon={true}
            title={id ? 'Abschluss verändern' : 'Abschluss hinzufügen'}
            fullWidth
            content={
                <div>
                    <Alert
                        type={[
                            'abschlussBetrag',
                            'abschlussKontoBargeld',
                            'abschlussZeitstempel',
                        ]}
                        style={{ marginBottom: '10px' }}
                    />

                    <Datefield
                        value={newTimestamp}
                        onChange={(newValue) =>
                            setNewTimestamp(newValue.startOf('day').valueOf())
                        }
                        toolbarFormat={'DD. MMMM'}
                        style={{
                            marginTop: '10px',
                            marginBottom: '20px',
                            width: 'calc(50% - 20px / 2)',
                        }}
                    />
                    <Stack
                        direction={'row'}
                        spacing={'20px'}
                        sx={{
                            display: 'flex',
                        }}
                    >
                        <Numberfield
                            margin
                            autoFocus
                            placeholder={'Konto'}
                            value={newKonto}
                            onChange={(val) => {
                                setNewKonto(val);
                                dispatch(resetMessage());
                            }}
                            onError={(val) => setKontoError(val)}
                            end="€"
                        />
                        <Numberfield
                            margin
                            placeholder={'Bargeld'}
                            value={newBargeld}
                            onChange={(val) => {
                                setNewBargeld(val);
                                dispatch(resetMessage());
                            }}
                            onError={(val) => setBargeldError(val)}
                            end="€"
                        />
                    </Stack>
                </div>
            }
            actions={
                <>
                    {id && (
                        <Button
                            onClick={async () => {
                                const confirmed = await dialogs.open(
                                    ConfirmDialog,
                                    {
                                        title: 'Abschluss löschen',
                                        message:
                                            'Möchtest du wirklich deinen Abschluss löschen?',
                                        yes: 'Bestätigen',
                                        no: 'Abbrechen',
                                    },
                                );
                                if (confirmed) {
                                    dispatch(deleteAbschluss(id, timestamp));
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
            }
        />
    );
};

export default AddAbschluss;
