import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiPencil } from '@mdi/js';
import AddKategorie from './AddKategorie';
import Button from './Button';
import Table from './Table';
import IconButton from './IconButton';

const Kategorien = () => {
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const kategorien = useSelector(
        (state) => state.dataframe.original.kategorien,
    )
        ?.filter((row) => row.get('KategorieID') > 2)
        // .sortBy('KategorieLow')
        .toCollection();

    return kategorien ? (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="contained"
                sx={{ marginBottom: 1.5 }}
            >
                Kategorie hinzufügen
            </Button>
            <AddKategorie
                open={open}
                onClose={() => {
                    setOpen(false);
                    setData({});
                }}
                id={data.id}
                oberkategorie={data.oberkategorie}
                unterkategorie={data.unterkategorie}
            />
            {kategorien.length > 0 ? (
                <Table
                    height={'calc(100vh - 123px - 56px - 16px)'}
                    type="kategorie"
                    orderBy={'Kategorie'}
                    head={[{ value: '' }, { value: 'Kategorie', sort: true }]}
                    body={kategorien.map((row) => {
                        var unterkategorie = row['Kategorie'].startsWith(
                            `${row['Oberkategorie']} | `,
                        )
                            ? row['Unterkategorie']
                            : '';
                        return [
                            {
                                value: (
                                    <IconButton
                                        color="inherit"
                                        onClick={() => {
                                            setData({
                                                id: row['ID'],
                                                oberkategorie:
                                                    row['Oberkategorie'],
                                                unterkategorie: unterkategorie,
                                            });
                                            setOpen(true);
                                        }}
                                        sx={{
                                            color: (theme) =>
                                                theme.palette.text.secondary,
                                        }}
                                    >
                                        <Icon path={mdiPencil} size={0.8} />
                                    </IconButton>
                                ),
                                width: '35px',
                            },
                            {
                                value: row['Kategorie'],
                            },
                        ];
                    })}
                />
            ) : (
                <Typography
                    component="div"
                    sx={{
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    Es wurde bisher keine Kategorie erstellt. Füge{' '}
                    <span
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                        onClick={() => setOpen(true)}
                    >
                        hier
                    </span>{' '}
                    eine Kategorie hinzu.
                </Typography>
            )}
        </>
    ) : null;
};

export default Kategorien;
