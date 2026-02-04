import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiPencil } from '@mdi/js';
import Table from './Table';
import AddWiederkehrenderUmsatz from './AddWiederkehrenderUmsatz';
import Button from './Button';
import IconButton from './IconButton';

const WiederkehrenderUmsatz = () => {
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const wiederkehrenderUmsatz = useSelector(
        (state) => state.dataframe.original.wiederkehrenderUmsatz,
    )
        // ?.sortBy('Tag')
        .toCollection();

    return wiederkehrenderUmsatz ? (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="contained"
                sx={{ marginBottom: 1.5 }}
            >
                wiederkehrenden Umsatz hinzufügen
            </Button>
            <AddWiederkehrenderUmsatz
                open={open}
                onClose={() => {
                    setOpen(false);
                    setData({});
                }}
                id={data.id}
                tag={data.tag}
                art={data.art || 'Ausgabe'}
                betrag={data.betrag}
                kategorie={data.kategorie}
                beschreibung={data.beschreibung}
                bemerkung={data.bemerkung}
            />
            {wiederkehrenderUmsatz.length > 0 ? (
                <Table
                    type="wiederkehrendenUmsatz"
                    orderBy={'Tag'}
                    head={[
                        { value: '' },
                        { value: 'Tag', sort: true },
                        { value: 'Betrag', sort: true },
                        { value: 'Art', sort: true },
                        { value: 'Kategorie', sort: true },
                        { value: 'Beschreibung', sort: true },
                        { value: 'Bemerkung', sort: true },
                    ]}
                    body={wiederkehrenderUmsatz.map((row) => [
                        {
                            value: (
                                <IconButton
                                    color="inherit"
                                    onClick={() => {
                                        setData({
                                            id: row['ID'],
                                            tag: row['Tag'],
                                            art: row['Art'],
                                            betrag: row['Betrag'],
                                            kategorie: row['KategorieID'],
                                            beschreibung: row['Beschreibung'],
                                            bemerkung: row['Bemerkung'],
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
                            value: row['Tag'],
                            sortValue: Number(row['Tag']),
                        },
                        {
                            value: `${row['Betrag'].toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })} €`,
                            sortValue: row['Betrag'],
                            align: 'right',
                        },
                        {
                            value: row['Art'],
                        },
                        {
                            value: row['Kategorie'],
                        },
                        {
                            value: row['Beschreibung'],
                        },
                        {
                            value: row['Bemerkung'],
                        },
                    ])}
                />
            ) : (
                <Typography
                    component="div"
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    Es gibt aktuell keine wiederkehrenden Umsätze. Spare
                    zukünftig Zeit und hinterlege{' '}
                    <span
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                        onClick={() => setOpen(true)}
                    >
                        hier
                    </span>{' '}
                    alle monatlich wiederkehrenden Umsätze.
                </Typography>
            )}
        </>
    ) : null;
};

export default WiederkehrenderUmsatz;
