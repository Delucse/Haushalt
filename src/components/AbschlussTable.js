import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiPencil } from '@mdi/js';
import AddAbschluss from './AddAbschluss';
import { useState } from 'react';
import Table from './Table';
import IconButton from './IconButton';

function AbschlussTable() {
    const [data, setData] = useState({});
    const abschlussFilteredCollection = useSelector(
        (state) => state.dataframe.filtered.abschluss,
    )?.toCollection();

    return (
        <>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Abschluss
            </Typography>
            {abschlussFilteredCollection ? (
                abschlussFilteredCollection.length > 0 ? (
                    <>
                        <Table
                            type="abschluss"
                            orderBy={'Datum'}
                            head={[
                                { value: '' },
                                { value: 'Datum', sort: true },
                                { value: 'Konto', sort: true },
                                { value: 'Bargeld', sort: true },
                            ]}
                            body={abschlussFilteredCollection.map((row) => [
                                {
                                    value: (
                                        <IconButton
                                            color="inherit"
                                            onClick={() =>
                                                setData({
                                                    id: row['ID'],
                                                    timestamp:
                                                        row['Zeitstempel'],
                                                    konto: row['Konto'],
                                                    bargeld: row['Bargeld'],
                                                })
                                            }
                                            sx={{
                                                color: (theme) =>
                                                    theme.palette.text
                                                        .secondary,
                                            }}
                                        >
                                            <Icon path={mdiPencil} size={0.8} />
                                        </IconButton>
                                    ),
                                    width: '35px',
                                },
                                {
                                    value: row['Datum'],
                                    sortValue: row['Zeitstempel'],
                                },
                                {
                                    value: `${row['Konto'].toLocaleString(
                                        'de-DE',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )} €`,
                                    sortValue: row['Konto'],
                                    align: 'right',
                                },
                                {
                                    value: `${row['Bargeld'].toLocaleString(
                                        'de-DE',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )} €`,
                                    sortValue: row['Bargeld'],
                                    align: 'right',
                                },
                            ])}
                        />
                        <AddAbschluss
                            open={data.id}
                            onClose={() => setData({})}
                            id={data.id}
                            timestamp={data.timestamp}
                            konto={data.konto}
                            bargeld={data.bargeld}
                        />
                    </>
                ) : (
                    <Typography
                        component="div"
                        sx={{ color: (theme) => theme.palette.text.primary }}
                    >
                        keine Einträge gefunden
                    </Typography>
                )
            ) : null}
        </>
    );
}

export default AbschlussTable;
