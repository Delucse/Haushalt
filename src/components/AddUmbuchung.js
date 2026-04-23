import { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';
import {
    addUmbuchung,
    changeUmbuchung,
    deleteUmbuchung,
} from '../actions/dataframeActions/umbuchungActions';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';

import moment from 'moment';

import { useDialogs } from '@toolpad/core/useDialogs';
import { Stack } from '@mui/material';

import Button from './Button';
import Textfield from './Textfield';
import Numberfield from './Numberfield';
import Datefield from './Datefield';
import Alert from './Alert';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';

const AddUmbuchung = ({ open, id, timestamp, betrag, bemerkung, onClose }) => {
    const dialogs = useDialogs();

    const dispatch = useDispatch();

    const [newTimestamp, setNewTimestamp] = useState(timestamp);
    const [newBetrag, setNewBetrag] = useState(betrag);
    const [betragError, setBetragError] = useState(false);
    const [newBemerkung, setNewBemerkung] = useState(bemerkung);

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
                <>
                    {id && (
                        <Button
                            onClick={async () => {
                                const confirmed = await dialogs.open(
                                    ConfirmDialog,
                                    {
                                        title: 'Umbuchung löschen',
                                        message:
                                            'Möchtest du wirklich deine Umbuchung löschen?',
                                        yes: 'Bestätigen',
                                        no: 'Abbrechen',
                                    },
                                );
                                if (confirmed) {
                                    dispatch(deleteUmbuchung(id, timestamp));
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

export default AddUmbuchung;
