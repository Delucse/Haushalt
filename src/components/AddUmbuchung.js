import { useDispatch } from 'react-redux';
import Button from './Button';
import Dialog from './Dialog';
import {
    addUmbuchung,
    changeUmbuchung,
    deleteUmbuchung,
} from '../actions/dataframeActions/umbuchungActions';
import { useEffect, useState } from 'react';
import Textfield from './Textfield';
import Numberfield from './Numberfield';
import Alert from './Alert';
import Datefield from './Datefield';
import { Stack } from '@mui/material';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';
import moment from 'moment';

const AddUmbuchung = ({ open, id, timestamp, betrag, bemerkung, onClose }) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newBetrag, setNewBetrag] = useState(betrag);
    const [betragError, setBetragError] = useState(false);
    const [newBemerkung, setNewBemerkung] = useState(bemerkung);

    const dispatch = useDispatch();

    const submit = () => {
        if (newBetrag !== undefined && newBetrag !== '') {
            if (!betragError) {
                if (newBetrag !== 0) {
                    var calcTimestamp = newTimestamp;
                    if (!newTimestamp)
                        calcTimestamp = moment().startOf('day').valueOf();
                    if (id) {
                        if (
                            calcTimestamp !== timestamp ||
                            newBetrag !== betrag ||
                            newBemerkung !== bemerkung
                        ) {
                            dispatch(
                                changeUmbuchung(
                                    id,
                                    calcTimestamp,
                                    newBetrag,
                                    newBemerkung,
                                ),
                            );
                        }
                    } else {
                        dispatch(
                            addUmbuchung(
                                calcTimestamp, // ? newDate : new Date(),
                                newBetrag,
                                newBemerkung,
                            ),
                        );
                    }
                    close();
                } else {
                    dispatch(
                        alertErrorMessage(
                            'Der Betrag darf nicht 0,00 € betragen.',
                            'umbuchungBetrag',
                        ),
                    );
                }
            } else {
                dispatch(
                    alertErrorMessage(
                        'Betrag: Ungültige Zahl bzw. arithmetischer Ausdruck.',
                        'umbuchungBetrag',
                    ),
                );
            }
        } else {
            dispatch(
                alertErrorMessage(
                    'Die Angabe des Umbuchungsbetrages ist verpflichtend.',
                    'umbuchungBetrag',
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
        setNewBetrag('');
        setNewBemerkung('');
        setBetragError(false);
    };

    useEffect(() => {
        setNewTimestamp(timestamp);
        setNewBetrag(betrag);
        setNewBemerkung(bemerkung);
        // eslint-disable-next-line
    }, [id]);

    return (
        <>
            <Dialog
                open={open}
                onClose={closeDialog}
                closeIcon={true}
                title={id ? 'Umbuchung verändern' : 'Umbuchung hinzufügen'}
                fullWidth
                content={
                    <div>
                        <Alert
                            type={['umbuchungBetrag']}
                            style={{ marginBottom: '20px' }}
                        />

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
                        <Textfield
                            style={{ marginBottom: '4px' }}
                            placeholder={'Bemerkung'}
                            value={newBemerkung}
                            onChange={(e) => {
                                setNewBemerkung(e.target.value);
                            }}
                        />
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
                        <Button
                            // disabled={error}
                            onClick={submit}
                            variant="contained"
                        >
                            Bestätigen
                        </Button>
                    </div>
                }
            />
            {id && (
                <Dialog
                    open={deleteOpen}
                    title={'Umbuchung löschen'}
                    content={'Möchtest du wirklich deine Umbuchung löschen?'}
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
                                    dispatch(deleteUmbuchung(id, timestamp));
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

export default AddUmbuchung;
