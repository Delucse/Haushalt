import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
    addKategorie,
    changeKategorie,
    deleteKategorie,
} from '../actions/dataframeActions/kategorienActions';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';

import { useDialogs } from '@toolpad/core/useDialogs';

import Button from './Button';
import Textfield from './Textfield';
import Alert from './Alert';
import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';

const AddKategorie = ({ open, id, oberkategorie, unterkategorie, onClose }) => {
    const dialogs = useDialogs();

    const dispatch = useDispatch();
    const error = useSelector((state) => state.message.error);
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien,
    )
        ?.filter((row) => row.get('ID') !== id)
        .toDict()['Kategorie'];

    const [newOberkategorie, setNewOberkategorie] = useState('');
    const [newUnterkategorie, setNewUnterkategorie] = useState('');

    const submit = () => {
        if (newOberkategorie && newOberkategorie.trim().length > 0) {
            const newKategorie = `${newOberkategorie}${
                newUnterkategorie && ` | ${newUnterkategorie}`
            }`;
            if (!kategorien.includes(newKategorie)) {
                if (id) {
                    if (
                        newOberkategorie !== oberkategorie ||
                        newUnterkategorie !== unterkategorie
                    ) {
                        dispatch(
                            changeKategorie(
                                id,
                                newOberkategorie,
                                newUnterkategorie,
                            ),
                        );
                    }
                } else {
                    dispatch(addKategorie(newOberkategorie, newUnterkategorie));
                }
                close();
            } else {
                dispatch(
                    alertErrorMessage(
                        `Die Kategorie "${newKategorie}" existiert bereits.`,
                        'kategorie',
                    ),
                );
            }
        } else {
            dispatch(
                alertErrorMessage(
                    'Die Angabe einer Oberkategorie ist verpflichtend.',
                    'kategorie',
                ),
            );
        }
    };

    const close = () => {
        onClose();
        setNewOberkategorie('');
        setNewUnterkategorie('');
    };

    useEffect(() => {
        setNewOberkategorie(oberkategorie);
        setNewUnterkategorie(unterkategorie);
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (error) {
            dispatch(resetMessage());
        }
        return () => {
            if (error) {
                dispatch(resetMessage());
            }
        };
        // eslint-disable-next-line
    }, [newOberkategorie]);

    return (
        <Dialog
            open={open}
            onClose={close}
            closeIcon={true}
            title={id ? 'Kategorie verändern' : 'Kategorie hinzufügen'}
            fullWidth
            content={
                <div>
                    <Alert
                        type={['kategorie']}
                        style={{ marginBottom: '20px' }}
                    />

                    <Textfield
                        autoFocus
                        placeholder={'Oberkategorie'}
                        style={{ marginBottom: '20px' }}
                        value={newOberkategorie}
                        onChange={(e) => {
                            setNewOberkategorie(e.target.value);
                        }}
                    />
                    <Textfield
                        placeholder={'Unterkategorie'}
                        value={newUnterkategorie}
                        onChange={(e) => {
                            setNewUnterkategorie(e.target.value);
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
                                        title: 'Kategorie löschen',
                                        message:
                                            'Möchtest du wirklich die Kategorie löschen? All deine verknüpften Umsätze werden auf "nicht zugeordnet" gesetzt.',
                                        yes: 'Bestätigen',
                                        no: 'Abbrechen',
                                    },
                                );
                                if (confirmed) {
                                    dispatch(deleteKategorie(id));
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

export default AddKategorie;
