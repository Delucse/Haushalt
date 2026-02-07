import { useDispatch, useSelector } from 'react-redux';
import Button from './Button';
import Dialog from './Dialog';
import {
    addAbschluss,
    changeAbschluss,
    deleteAbschluss,
} from '../actions/dataframeActions/abschlussActions';
import { useEffect, useState } from 'react';
import Numberfield from './Numberfield';
import Alert from './Alert';
import Datefield from './Datefield';
import { Stack } from '@mui/material';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';
import moment from 'moment';

const AddAbschluss = ({ open, id, timestamp, konto, bargeld, onClose }) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newKonto, setNewKonto] = useState(konto);
    const [kontoError, setKontoError] = useState(false);
    const [newBargeld, setNewBargeld] = useState(bargeld);
    const [bargeldError, setBargeldError] = useState(false);

    const dispatch = useDispatch();
    const abschluss = useSelector(
        (state) => state.dataframe.original.abschluss,
    );

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
        <>
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
                                setNewTimestamp(
                                    newValue.startOf('day').valueOf(),
                                )
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
                        <Button onClick={submit} variant="contained">
                            Bestätigen
                        </Button>
                    </div>
                }
            />
            {id && (
                <Dialog
                    open={deleteOpen}
                    title={'Abschluss löschen'}
                    content={'Möchtest du wirklich deinen Abschluss löschen?'}
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
                                    dispatch(deleteAbschluss(id, timestamp));
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
    );
};

export default AddAbschluss;
