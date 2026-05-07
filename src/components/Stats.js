import { useSelector } from 'react-redux';

import { Box, Stack } from '@mui/material';

import Icon from '@mdi/react';
import { mdiCartVariant, mdiCashMultiple, mdiPiggyBank } from '@mdi/js';

const Stat = ({ betrag, percent, icon, print }) => {
    return (
        <Stack
            direction="row"
            sx={{
                display: 'flex',
                height: 'calc((100% / 3) - 12px)',
                padding: '12px 0',
                color: !print ? (theme) => theme.palette.text.primary : '#000',
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
                            width: !print
                                ? {
                                      xxs: '100%',
                                      xs: 'calc(60% - 8px)',
                                      md: '100%',
                                      lg: 'calc(60% - 8px)',
                                  }
                                : 'calc(60% - 8px)',
                            justifyContent: 'end',
                            alignItems: 'center',
                            display: 'flex',
                            marginRight: !print
                                ? {
                                      xxs: '0px',
                                      xs: '8px',
                                      md: '0px',
                                      lg: '8px',
                                  }
                                : '8px',
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
                    {percent !== undefined && (
                        <Box
                            sx={{
                                width: '40%',
                                justifyContent: 'end',
                                alignItems: 'center',
                                display: !print
                                    ? {
                                          xxs: 'none',
                                          xs: 'flex',
                                          md: 'none',
                                          lg: 'flex',
                                      }
                                    : 'flex',
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
            </Stack>
        </Stack>
    );
};

const Stats = ({ print }) => {
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
            <Stat betrag={einnahmen} icon={mdiCashMultiple} print={print} />
            <Box
                sx={{
                    borderBottom: '1px solid',
                    borderColor: (theme) =>
                        print === 'dark'
                            ? theme.palette.primary.light
                            : theme.palette.primary.main,
                    padding: '0 12px',
                }}
            />
            <Stat
                betrag={ausgaben}
                icon={mdiCartVariant}
                percent={einnahmen !== 0 && ausgaben / einnahmen}
                print={print}
            />
            <Box
                sx={{
                    borderBottom: '1px solid',
                    borderColor: (theme) =>
                        print === 'dark'
                            ? theme.palette.primary.light
                            : theme.palette.primary.main,
                    padding: '0 12px',
                }}
            />
            <Stat
                betrag={umsatz}
                icon={mdiPiggyBank}
                percent={einnahmen !== 0 && umsatz / einnahmen}
                print={print}
            />
        </Stack>
    ) : null;
};

export default Stats;
