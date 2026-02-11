import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { Typography, Box } from '@mui/material';

import Icon from '@mdi/react';
import { mdiPencil, mdiPencilLock } from '@mdi/js';

import AddUmsatz from './AddUmsatz';
import Table from './Table';
import IconButton from './IconButton';
import Search from './Search';

const UmsatzTable = () => {
    const [data, setData] = useState({});

    const search = useSelector((state) => state.filter.word.toLowerCase());
    const isSearch = search.length > 0;

    const umsatzFiltered = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    );
    const abschluss = useSelector(
        (state) => state.dataframe.original.abschluss,
    );
    const wiederkehrenderUmsatz = useSelector(
        (state) => state.dataframe.original.wiederkehrenderUmsatz,
    );
    const maxAbschluss = abschluss?.stat.max('Zeitstempel');
    const monatsposten = wiederkehrenderUmsatz?.filter(
        (row) => row.get('Zeitstempel') > maxAbschluss,
    );
    const umsatzFilteredWithoutNichtGelistet = umsatzFiltered?.filter(
        (row) => row.get('KategorieID') > 1,
    );
    const umsatzFilteredCollection =
        umsatzFilteredWithoutNichtGelistet?.toCollection();

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
                                textAlign: 'right',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {umsatzFilteredCollection.length} Posten
                            <br />
                            {umsatzFilteredWithoutNichtGelistet.stat
                                .sum('Umsatz')
                                .toLocaleString('de-DE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                    style: 'currency',
                                    currency: 'EUR',
                                })
                                .replace('-', '- ')}
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
                                        (row) => {
                                            const monatspostenNotActive =
                                                monatsposten
                                                    .filter(
                                                        (r) =>
                                                            r.get(
                                                                'Zeitstempel',
                                                            ) ===
                                                                row[
                                                                    'Zeitstempel'
                                                                ] &&
                                                            r.get('Art') ===
                                                                row['Art'] &&
                                                            r.get('Betrag') ===
                                                                row['Betrag'] &&
                                                            'fix' ===
                                                                row['Typ'] &&
                                                            r.get(
                                                                'KategorieID',
                                                            ) ===
                                                                row[
                                                                    'KategorieID'
                                                                ] &&
                                                            r.get(
                                                                'Beschreibung',
                                                            ) ===
                                                                row[
                                                                    'Beschreibung'
                                                                ] &&
                                                            r.get(
                                                                'Bemerkung',
                                                            ) ===
                                                                row[
                                                                    'Bemerkung'
                                                                ],
                                                    )
                                                    .count() > 0;
                                            return [
                                                {
                                                    value: (
                                                        <IconButton
                                                            color="inherit"
                                                            onClick={() =>
                                                                setData({
                                                                    id: row[
                                                                        'ID'
                                                                    ],
                                                                    timestamp:
                                                                        row[
                                                                            'Zeitstempel'
                                                                        ],
                                                                    art: row[
                                                                        'Art'
                                                                    ],
                                                                    betrag: row[
                                                                        'Betrag'
                                                                    ],
                                                                    typ: row[
                                                                        'Typ'
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
                                                                color: (
                                                                    theme,
                                                                ) =>
                                                                    monatspostenNotActive
                                                                        ? theme
                                                                              .palette
                                                                              .text
                                                                              .disabled
                                                                        : theme
                                                                              .palette
                                                                              .text
                                                                              .secondary,
                                                            }}
                                                        >
                                                            <Icon
                                                                path={
                                                                    monatspostenNotActive
                                                                        ? mdiPencilLock
                                                                        : mdiPencil
                                                                }
                                                                size={0.8}
                                                            />
                                                        </IconButton>
                                                    ),
                                                    width: '36px',
                                                },
                                                {
                                                    value: row['Datum'],
                                                    sortValue:
                                                        row['Zeitstempel'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Datum'].includes(
                                                            search,
                                                        ),
                                                    disabled:
                                                        monatspostenNotActive,
                                                    width: '72px',
                                                },
                                                {
                                                    value: row['Betrag']
                                                        .toLocaleString(
                                                            'de-DE',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                                style: 'currency',
                                                                currency: 'EUR',
                                                            },
                                                        )
                                                        .replace('-', '- '),
                                                    sortValue: row['Betrag'],
                                                    align: 'right',
                                                    highlighted:
                                                        isSearch &&
                                                        row['Betrag']
                                                            .toLocaleString(
                                                                'de-DE',
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                },
                                                            )
                                                            .replace('-', '- ')
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                                {
                                                    value: row['Art'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Art']
                                                            .toLowerCase()
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                                {
                                                    value: row['Kategorie'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Kategorie']
                                                            .toLowerCase()
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                                {
                                                    value: row['Typ'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Typ']
                                                            .toLowerCase()
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                                {
                                                    value: row['Beschreibung'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Beschreibung']
                                                            .toLowerCase()
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                                {
                                                    value: row['Bemerkung'],
                                                    highlighted:
                                                        isSearch &&
                                                        row['Bemerkung']
                                                            .toLowerCase()
                                                            .includes(search),
                                                    disabled:
                                                        monatspostenNotActive,
                                                },
                                            ];
                                        },
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
