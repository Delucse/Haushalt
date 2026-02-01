import { useDispatch, useSelector } from 'react-redux';
import Button from './Button';
import Dialog from './Dialog';
import {
    addKategorie,
    changeKategorie,
    deleteKategorie,
} from '../actions/dataframeActions/kategorienActions';
import { useEffect, useState } from 'react';
import Textfield from './Textfield';
import Alert from './Alert';
import { alertErrorMessage, resetMessage } from '../actions/messageActions';
import Autocomplete from './Autocomplete';

const AddKategorie = ({
    open,
    id,
    oberkategorie,
    unterkategorie,
    typ,
    onClose,
}) => {
    const dispatch = useDispatch();
    const error = useSelector((state) => state.message.error);
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien,
    )
        ?.filter((row) => row.get('ID') !== id)
        .toDict()['Kategorie'];

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newOberkategorie, setNewOberkategorie] = useState('');
    const [newUnterkategorie, setNewUnterkategorie] = useState('');
    const [newTyp, setNewTyp] = useState('');

    const submit = () => {
        if (
            newOberkategorie &&
            newOberkategorie.trim().length > 0 &&
            newTyp &&
            newTyp.trim().length > 0
        ) {
            const newKategorie = `${newOberkategorie}${
                newUnterkategorie && ` | ${newUnterkategorie}`
            }`;
            if (!kategorien.includes(newKategorie)) {
                if (id) {
                    if (
                        newOberkategorie !== oberkategorie ||
                        newUnterkategorie !== unterkategorie ||
                        newTyp !== typ
                    ) {
                        dispatch(
                            changeKategorie(
                                id,
                                newOberkategorie,
                                newUnterkategorie,
                                newTyp,
                            ),
                        );
                    }
                } else {
                    dispatch(
                        addKategorie(
                            newOberkategorie,
                            newUnterkategorie,
                            newTyp,
                        ),
                    );
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
                    'Die Angabe einer Oberkategorie und Typs sind verpflichtend.',
                    'kategorie',
                ),
            );
        }
    };

    const close = () => {
        onClose();
        setNewOberkategorie('');
        setNewUnterkategorie('');
        setNewTyp('');
    };

    useEffect(() => {
        setNewOberkategorie(oberkategorie);
        setNewUnterkategorie(unterkategorie);
        setNewTyp(typ);
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
    }, [newOberkategorie, newTyp]);

    return (
        <>
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
                            style={{ marginBottom: '20px' }}
                            value={newUnterkategorie}
                            onChange={(e) => {
                                setNewUnterkategorie(e.target.value);
                            }}
                        />
                        <Autocomplete
                            value={newTyp}
                            placeholder={'Typ'}
                            options={['fix', 'variabel']}
                            fullWidth
                            onChange={(value) => {
                                setNewTyp(value);
                            }}
                            freeSolo
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
                    title={'Kategorie löschen'}
                    content={
                        'Möchtest du wirklich die Kategorie löschen? All deine verknüpften Umsätze werden auf "nicht zugeordnet" gesetzt.'
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
                                    dispatch(deleteKategorie(id));
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

export default AddKategorie;
