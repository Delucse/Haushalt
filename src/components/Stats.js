import { mdiCartVariant, mdiCashMultiple, mdiPiggyBank } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
// import moment from 'moment';

const Stat = ({ betrag, percent, icon, prevBetrag, avgBetrag }) => {
    return (
        <Stack
            direction="row"
            sx={{
                // justifyContent: 'center',
                // alignItems: 'center',
                display: 'flex',
                height: 'calc((100% / 3) - 12px)',
                // border: (theme) => `1px solid ${theme.palette.secondary.main}`,
                padding: '12px 0',
                color: (theme) => theme.palette.text.primary,
            }}
        >
            <Box
                sx={{
                    width: 'calc(100% / 3)',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    marginLeft: '-12px',
                }}
            >
                <Icon path={icon} size={2} />
            </Box>
            <Stack direction="column" sx={{ width: 'calc(100% / 3 * 2)' }}>
                <Stack
                    sx={{
                        height: '100%',
                    }}
                    direction="row"
                >
                    <Box
                        sx={{
                            width: 'calc(60% - 8px)',
                            justifyContent: 'end',
                            alignItems: 'center',
                            display: 'flex',
                            marginRight: '8px',
                            fontWeight: 'bold',
                            fontSize: '20px',
                        }}
                    >
                        {betrag
                            .toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'EUR',
                            })
                            .replace('-', '- ')}
                    </Box>
                    {percent && (
                        <Box
                            sx={{
                                width: '40%',
                                justifyContent: 'end',
                                alignItems: 'center',
                                display: 'flex',
                            }}
                        >
                            {percent
                                .toLocaleString('de-DE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                    style: 'percent',
                                })
                                .replace('-', '- ')}
                        </Box>
                    )}
                </Stack>
                {/* <Divider
                    flexItem
                    orientation="horizontal"
                    sx={{ borderColor: (theme) => theme.palette.primary.main }}
                />
                <Stack
                    direction="row"
                    sx={{
                        height: '50%',
                        alignItems: 'center',
                        display: 'flex',
                    }}
                >
                    <Box
                        style={{
                            width: 'calc(50% - 12px)',
                            textAlign: 'right',
                            marginRight: '12px',
                        }}
                    >
                        {prevBetrag &&
                            (betrag - prevBetrag).toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'EUR',
                            })
                            .replace('-', '- ')}
                    </Box>
                    <Divider
                        flexItem
                        orientation="vertical"
                        sx={{ borderColor: (theme) => theme.palette.primary.main }}
                    />
                    <Box
                        style={{
                            width: 'calc(50% - 12px)',
                            textAlign: 'right',
                            marginLeft: '12px',
                        }}
                    >
                        {false &&
                            avgBetrag.toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: 'currency',
                                currency: 'EUR',
                            })
                            .replace('-', '- ')}
                    </Box>
                </Stack> */}
            </Stack>
        </Stack>
    );
};

const Stats = () => {
    const umsatzFilteredDf = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    );
    const einnahmen = umsatzFilteredDf
        ?.filter({ Art: 'Einnahme' })
        .stat.sum('Betrag');
    const ausgaben = umsatzFilteredDf
        ?.filter({ Art: 'Ausgabe' })
        .stat.sum('Betrag');
    const umsatz = umsatzFilteredDf?.stat.sum('Umsatz');
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);

    return umsatzDf ? (
        <Stack direction="column" sx={{ height: '100%' }}>
            <Stat betrag={einnahmen} icon={mdiCashMultiple} />
            <Divider
                sx={{
                    borderColor: (theme) => theme.palette.primary.main,
                    padding: '0 12px',
                }}
            />
            <Stat
                betrag={ausgaben}
                icon={mdiCartVariant}
                percent={einnahmen !== 0 && ausgaben / einnahmen}
            />
            <Divider
                sx={{
                    borderColor: (theme) => theme.palette.primary.main,
                    padding: '0 12px',
                }}
            />
            <Stat
                betrag={umsatz}
                icon={mdiPiggyBank}
                percent={einnahmen !== 0 && umsatz / einnahmen}
            />
        </Stack>
    ) : null;
};

export default Stats;
