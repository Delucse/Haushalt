import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { Typography, Box, Chip } from '@mui/material';

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
    const maxAbschluss =
        abschluss?.count() > 0 && abschluss.stat.max('Zeitstempel');
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
                    ml: '-16px',
                    pb: '16px',
                    pl: '16px',
                    background: (theme) => theme.palette.background.default,
                    gap: '10px',
                    display: 'grid',
                }}
            >
                <Typography
                    component="div"
                    variant="body1"
                    sx={{
                        fontWeight: 'bold',
                        marginBottom: '10px',
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
                                display: 'flex',
                                ml: '16px',
                                mt: 'auto',
                                mb: 'auto',
                                flex: 0,
                                textAlign: 'right',
                                color: (theme) => theme.palette.text.primary,
                                textWrap: 'nowrap',
                            }}
                        >
                            {`${umsatzFilteredCollection.length.toLocaleString(
                                'de-DE',
                            )} Posten`}
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
                umsatzFilteredCollection.length > 0 ? (
                    <>
                        <Table
                            height={
                                'calc(100vh - 142px - 56px - 16px + 10px)' // - 34px
                            }
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
                                { value: '', sort: false },
                            ]}
                            body={umsatzFilteredCollection.map((row) => {
                                const monatspostenNotActive =
                                    row['Typ'] === 'fix' &&
                                    row['Zeitstempel'] > maxAbschluss &&
                                    monatsposten
                                        .filter(
                                            (r) =>
                                                r.get('Zeitstempel') ===
                                                    row['Zeitstempel'] &&
                                                r.get('Art') === row['Art'] &&
                                                r.get('Betrag') ===
                                                    row['Betrag'] &&
                                                r.get('KategorieID') ===
                                                    row['KategorieID'] &&
                                                r.get('Beschreibung') ===
                                                    row['Beschreibung'] &&
                                                r.get('Bemerkung') ===
                                                    row['Bemerkung'],
                                            // &&
                                            // r.get('Tags') ===
                                            //     row['Tags'],
                                        )
                                        .count() > 0;
                                return [
                                    {
                                        value: (
                                            <IconButton
                                                color="inherit"
                                                onClick={() =>
                                                    setData({
                                                        id: row['ID'],
                                                        timestamp:
                                                            row['Zeitstempel'],
                                                        art: row['Art'],
                                                        betrag: row['Betrag'],
                                                        typ: row['Typ'],
                                                        kategorie:
                                                            row['KategorieID'],
                                                        beschreibung:
                                                            row['Beschreibung'],
                                                        bemerkung:
                                                            row['Bemerkung'],
                                                        tags: row['Tags'],
                                                    })
                                                }
                                                sx={{
                                                    color: (theme) =>
                                                        monatspostenNotActive
                                                            ? theme.palette.text
                                                                  .disabled
                                                            : theme.palette.text
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
                                        sortValue: row['Zeitstempel'],
                                        highlighted:
                                            isSearch &&
                                            row['Datum'].includes(search),
                                        disabled: monatspostenNotActive,
                                        width: '72px',
                                    },
                                    {
                                        value: row['Betrag']
                                            .toLocaleString('de-DE', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                                style: 'currency',
                                                currency: 'EUR',
                                            })
                                            .replace('-', '- '),
                                        sortValue: row['Betrag'],
                                        align: 'right',
                                        highlighted:
                                            isSearch &&
                                            row['Betrag']
                                                .toLocaleString('de-DE', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })
                                                .replace('-', '- ')
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Art'],
                                        highlighted:
                                            isSearch &&
                                            row['Art']
                                                .toLowerCase()
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Kategorie'],
                                        highlighted:
                                            isSearch &&
                                            row['Kategorie']
                                                .toLowerCase()
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Typ'],
                                        highlighted:
                                            isSearch &&
                                            row['Typ']
                                                .toLowerCase()
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Beschreibung'],
                                        highlighted:
                                            isSearch &&
                                            row['Beschreibung']
                                                .toLowerCase()
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Bemerkung'],
                                        highlighted:
                                            isSearch &&
                                            row['Bemerkung']
                                                .toLowerCase()
                                                .includes(search),
                                        disabled: monatspostenNotActive,
                                    },
                                    {
                                        value: row['Tags'].map((v) => (
                                            <Chip
                                                label={v}
                                                color={
                                                    monatspostenNotActive
                                                        ? 'default'
                                                        : 'primary'
                                                }
                                                size="small"
                                                variant={
                                                    monatspostenNotActive
                                                        ? 'outlined'
                                                        : 'filled'
                                                }
                                                sx={{
                                                    margin: '5px',
                                                    borderColor: (theme) =>
                                                        theme.palette.text
                                                            .disabled,
                                                    color: monatspostenNotActive
                                                        ? (theme) =>
                                                              theme.palette.text
                                                                  .disabled
                                                        : (theme) =>
                                                              theme.palette
                                                                  .text,
                                                }}
                                            />
                                        )),
                                        highlighted:
                                            isSearch &&
                                            row['Tags'].some((tag) =>
                                                tag
                                                    .toLowerCase()
                                                    .includes(search),
                                            ),
                                    },
                                ];
                            })}
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
                            tags={data.tags}
                        />
                    </>
                ) : (
                    <Typography
                        component="div"
                        sx={{
                            color: (theme) => theme.palette.text.primary,
                        }}
                    >
                        keine Einträge gefunden
                    </Typography>
                )
            ) : null}
        </>
    );
};

export default UmsatzTable;
