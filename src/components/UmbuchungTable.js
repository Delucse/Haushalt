import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiPencil } from '@mdi/js';
import AddUmbuchung from './AddUmbuchung';
import { useState } from 'react';
import Table from './Table';
import IconButton from './IconButton';

function UmbuchungTable() {
    const [data, setData] = useState({});
    const umbuchungFilteredCollection = useSelector(
        (state) => state.dataframe.filtered.umbuchung,
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
                Umbuchung
            </Typography>
            {umbuchungFilteredCollection ? (
                umbuchungFilteredCollection.length > 0 ? (
                    <>
                        <Table
                            type="umbuchung"
                            orderBy={'Datum'}
                            head={[
                                { value: '' },
                                { value: 'Datum', sort: true },
                                { value: 'Betrag', sort: true },
                                { value: 'Bemerkung', sort: true },
                            ]}
                            body={umbuchungFilteredCollection.map((row) => [
                                {
                                    value: (
                                        <IconButton
                                            color="inherit"
                                            onClick={() =>
                                                setData({
                                                    id: row['ID'],
                                                    timestamp:
                                                        row['Zeitstempel'],
                                                    betrag: row['Betrag'],
                                                    bemerkung: row['Bemerkung'],
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
                                    width: '36px',
                                },
                                {
                                    value: row['Datum'],
                                    sortValue: row['Zeitstempel'],
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
                                    width: '100px',
                                },
                                {
                                    value: row['Bemerkung'],
                                },
                            ])}
                        />
                        <AddUmbuchung
                            open={data.id}
                            onClose={() => setData({})}
                            id={data.id}
                            timestamp={data.timestamp}
                            betrag={data.betrag}
                            bemerkung={data.bemerkung}
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

export default UmbuchungTable;
