import { useSelector } from 'react-redux';

import moment from 'moment/moment';

import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';

import Icon from '@mdi/react';
import { mdiFormatListBulletedTriangle } from '@mdi/js';

import { Stat } from './Stats';

const NichtGelistet = ({ print }) => {
    const range = useSelector((state) => state.filter.time.range);
    const umsatzFilteredDf = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    );

    const abschlussFilteredDf = useSelector(
        (state) => state.dataframe.filtered.abschluss,
    );
    const abschlussCount = abschlussFilteredDf.count();
    const isNichtGelistet =
        abschlussCount > 0 &&
        moment(
            abschlussFilteredDf.sortBy('Zeitstempel', true).toCollection()[0][
                'Zeitstempel'
            ],
        ).isBetween(range[0], range[1]);

    const ausgaben = umsatzFilteredDf
        ?.filter({ Art: 'Ausgabe' })
        .stat.sum('Betrag');

    const nichtGelistet = umsatzFilteredDf
        ?.filter({ KategorieID: '1' })
        .stat.sum('Betrag');

    const theme = useTheme();
    const downMedium = useMediaQuery(theme.breakpoints.down('md'));

    return downMedium && !print ? (
        <Box
            sx={{
                height: '100%',
                padding: '0 12px',
            }}
        >
            <Stat
                quantity={1}
                betrag={isNichtGelistet ? nichtGelistet : 'keine Angabe'}
                icon={mdiFormatListBulletedTriangle}
                percent={
                    isNichtGelistet && ausgaben !== 0
                        ? nichtGelistet / ausgaben
                        : undefined
                }
            />
        </Box>
    ) : (
        <Stack
            direction="column"
            sx={{
                color: !print ? (theme) => theme.palette.text.primary : '#000',
                padding: '12px',
                height: 'calc(100% - 2 * 12px)',
                width: 'calc(100% - 2 * 12px)',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    alignItems: 'center',
                    display: 'flex',
                    height: '50%',
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <Icon path={mdiFormatListBulletedTriangle} size={2} />
                </Box>
                <Box
                    sx={{
                        display: {
                            md: !print ? 'none' : 'inherit',
                            lg: 'inherit',
                        },
                    }}
                >
                    {isNichtGelistet &&
                        ausgaben !== 0 &&
                        (nichtGelistet / ausgaben)
                            .toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: 'percent',
                            })
                            .replace('-', '- ')}
                </Box>
            </Box>
            <Box
                sx={{
                    height: '50%',
                    justifyContent: 'end',
                    alignItems: 'center',
                    display: 'flex',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    textAlign: 'right',
                    wordWrap: 'anywhere',
                }}
            >
                {isNichtGelistet
                    ? nichtGelistet
                          .toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                              style: 'currency',
                              currency: 'EUR',
                          })
                          .replace('-', '- ')
                    : 'keine Angabe'}
            </Box>
        </Stack>
    );
};

export default NichtGelistet;
