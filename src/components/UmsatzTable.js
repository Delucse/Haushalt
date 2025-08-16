import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { Typography, Box } from '@mui/material';
import Icon from '@mdi/react';
import { mdiDelete, mdiMagnify, mdiPencil } from '@mdi/js';
import Textfield from './Textfield';
import AddUmsatz from './AddUmsatz';
import Table from './Table';
import IconButton from './IconButton';
import Filter from './Filter';

const Search = ({ submit }) => {
    const [word, setWord] = useState('');
    return (
        <Textfield
            placeholder="Suche"
            variant="outlined"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    submit(word.toLowerCase());
                }
            }}
            style={{ margin: '0 16px' }}
            labelStyle={{ marginLeft: '16px' }}
            start={<Icon path={mdiMagnify} size={1.1} />}
            end={
                <>
                    {word.length > 0 && (
                        <>
                            <IconButton
                                onClick={() => {
                                    setWord('');
                                    submit('');
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                sx={{
                                    '&:hover': {
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                    },
                                }}
                            >
                                <Icon path={mdiDelete} size={1} />
                            </IconButton>
                            <span style={{ margin: '0 10px 0 2px' }}>|</span>
                        </>
                    )}
                    <Filter icon />
                </>
            }
            fullWidth
        />
    );
};

function UmsatzTable() {
    const [data, setData] = useState({});
    const [search, setSearch] = useState('');
    const umsatzFiltered = useSelector(
        (state) => state.dataframe.filtered.umsatz
    )?.filter(
        (row) =>
            row.get('KategorieID') !== '1' &&
            (search === '' ||
                row.get('Bemerkung').toLowerCase().includes(search) ||
                row.get('Datum').includes(search) ||
                // row.get('Betrag').toLowerCase().includes(search) ||
                row.get('Art').toLowerCase().includes(search) ||
                row.get('Kategorie').toLowerCase().includes(search) ||
                row.get('Typ').toLowerCase().includes(search) ||
                row.get('Beschreibung').toLowerCase().includes(search))
    );
    // .sortBy('Zeitstempel');
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
                    <Search submit={setSearch} />
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
                                        ]
                                    )}
                                />
                                <AddUmsatz
                                    open={data.id}
                                    onClose={() => setData({})}
                                    id={data.id}
                                    timestamp={data.timestamp}
                                    art={data.art}
                                    betrag={data.betrag}
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
}

export default UmsatzTable;
