import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { Typography, Box } from '@mui/material';

import Icon from '@mdi/react';
import { mdiPencil } from '@mdi/js';

import AddUmsatz from './AddUmsatz';
import Table from './Table';
import IconButton from './IconButton';
import Search from './Search';

const UmsatzTable = () => {
    const [data, setData] = useState({});
    const umsatzFiltered = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    );
    const umsatzFilteredCollection = umsatzFiltered.toCollection();

    return (
        <>
            <Box
                sx={{
                    ml: -2,
                    pb: 2,
                    mt: -2,
                    pt: 2,
                    position: 'fixed',
                    width: '100%',
                    zIndex: 1,
                    background: (theme) => theme.palette.background.default,
                }}
            >
                <Typography
                    component="div"
                    variant="body1"
                    sx={{
                        marginLeft: 2,
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    Umsatz
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                    }}
                >
                    <Search filter />
                    {umsatzFilteredCollection ? (
                        <Typography
                            component="div"
                            sx={{
                                mr: 2,
                                mt: 'auto',
                                mb: 'auto',
                                width: '100px',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {umsatzFilteredCollection.length} Posten
                            <br />
                            {`${umsatzFiltered.stat
                                .sum('Umsatz')
                                .toLocaleString('de-DE', {
                                    minimumFractionDigits: 2,
                                })} €`}
                        </Typography>
                    ) : null}
                </Box>
            </Box>
            {umsatzFilteredCollection ? (
                <>
                    <Box sx={{ mt: 'calc(2 * 16px + 56px + 24px)' }}>
                        {umsatzFilteredCollection.length > 0 ? (
                            <>
                                <Table
                                    type="umsatz"
                                    orderBy={'Datum'}
                                    head={[
                                        { value: '' },
                                        { value: 'Datum', sort: true },
                                        { value: 'Betrag', sort: true },
                                        { value: 'Art', sort: true },
                                        { value: 'Kategorie', sort: true },
                                        { value: 'Typ', sort: true },
                                        { value: 'Beschreibung', sort: true },
                                        { value: 'Bemerkung', sort: true },
                                    ]}
                                    body={umsatzFilteredCollection.map(
                                        (row) => [
                                            {
                                                value: (
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            setData({
                                                                id: row['ID'],
                                                                timestamp:
                                                                    row[
                                                                        'Zeitstempel'
                                                                    ],
                                                                art: row['Art'],
                                                                betrag: row[
                                                                    'Betrag'
                                                                ],
                                                                typ: row['Typ'],
                                                                kategorie:
                                                                    row[
                                                                        'KategorieID'
                                                                    ],
                                                                beschreibung:
                                                                    row[
                                                                        'Beschreibung'
                                                                    ],
                                                                bemerkung:
                                                                    row[
                                                                        'Bemerkung'
                                                                    ],
                                                            })
                                                        }
                                                        sx={{
                                                            color: (theme) =>
                                                                theme.palette
                                                                    .text
                                                                    .secondary,
                                                        }}
                                                    >
                                                        <Icon
                                                            path={mdiPencil}
                                                            size={0.8}
                                                        />
                                                    </IconButton>
                                                ),
                                                width: '35px',
                                            },
                                            {
                                                value: row['Datum'],
                                                sortValue: row['Zeitstempel'],
                                            },
                                            {
                                                value: `${row[
                                                    'Betrag'
                                                ].toLocaleString('de-DE', {
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
                                                value: row['Typ'],
                                            },
                                            {
                                                value: row['Beschreibung'],
                                            },
                                            {
                                                value: row['Bemerkung'],
                                            },
                                        ],
                                    )}
                                />
                                <AddUmsatz
                                    open={data.id}
                                    onClose={() => setData({})}
                                    id={data.id}
                                    timestamp={data.timestamp}
                                    art={data.art}
                                    betrag={data.betrag}
                                    typ={data.typ}
                                    kategorie={data.kategorie}
                                    beschreibung={data.beschreibung}
                                    bemerkung={data.bemerkung}
                                />
                            </>
                        ) : (
                            <Typography
                                component="div"
                                sx={{
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                keine Einträge gefunden
                            </Typography>
                        )}
                    </Box>
                </>
            ) : null}
        </>
    );
};

export default UmsatzTable;
