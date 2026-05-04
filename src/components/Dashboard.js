import { useState } from 'react';

import { useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import Icon from '@mdi/react';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import IconButton from './IconButton';
import Alert from './Alert';
import Dialog from './Dialog';

// import Print from './Print';
import Loader from './Loader';
import Filter from './Filter';
import EinnahmenBarChart from './EinnahmenBarChart';
import AusgabenBarChart from './AusgabenBarChart';
import UmsatzBarChart from './UmsatzBarChart';
import AusgabenPieChart from './AusgabenPieChart';
import AusgabenTreeMap from './AusgabenTreeMap';
import Stats from './Stats';

const charts = {
    Gesamt: <UmsatzBarChart />,
    Einnahmen: <EinnahmenBarChart />,
    Ausgaben: <AusgabenBarChart />,
    'Ausgaben nach Typ': <AusgabenPieChart />,
    'Ausgaben je Kategorie': <AusgabenTreeMap />,
};

const Title = ({ name, onClick, print }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                position: 'relative',
                marginBottom: 1.5,
                marginTop: '-4px',
                width: 'calc(100% + 2px)',
            }}
        >
            <Typography
                component="div"
                variant="body1"
                sx={{
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                    flexGrow: 1,
                }}
            >
                {name}
            </Typography>
            {!print && (
                <IconButton
                    sx={{
                        padding: 0,
                        color: (theme) => theme.palette.primary.light,
                        height: 'fit-content',
                    }}
                    onClick={onClick}
                >
                    <Icon path={mdiFullscreen} size={1} />
                </IconButton>
            )}
        </Box>
    );
};

const Chart = ({ print, title, onClick, chart, sx }) => {
    return (
        <Box sx={{ padding: '12px', height: 'calc(100% - 2 * 12px)' }}>
            <Title name={title} onClick={onClick} print={print} />
            <Box sx={sx}>{chart}</Box>
        </Box>
    );
};

const rows = 6;
const cols = 24;
const boxHeight = `calc((100vh - (56px + 2 * 16px + 33.6px + 12px)) / 2)`;

const Item = ({ col, row, sx, order, display, print, children }) => {
    return (
        <Box
            sx={{
                gridColumn: {
                    xxs: `span ${cols}`,
                    md: `span ${cols * col}`,
                },
                gridRow: {
                    xxs: 'unset',
                    md: `span ${rows * row}`,
                },
                height: {
                    xxs: `calc(${boxHeight} * ${row} - 2 * 0.8px - 12px * ${row < 1 ? '2 / 3' : row > 1 ? '1 / 3' : '1 / 2'})`,
                    md: 'inherit',
                },
                order: order,
                display: {
                    xxs: display ? 'initial' : 'none',
                    md: 'initial',
                },
                border: (theme) => `1px solid ${theme.palette.primary.main}`,
                ...sx,
            }}
        >
            {children}
        </Box>
    );
};

const Dashboard = ({ print }) => {
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);
    const settings = useSelector((state) => state.settings.dashboard);
    const init = useSelector((state) => !state.dataframe.progress);
    const theme = useTheme();

    const [fullscreen, setFullscreen] = useState('');

    const downMedium = useMediaQuery(theme.breakpoints.down('md'));

    return init ? (
        !(downMedium && !Object.values(settings).includes(true)) ? (
            umsatzDf && (
                <Box id="dashboard">
                    <Box
                        sx={{
                            display: 'flex',
                            position: 'sticky',
                            zIndex: 1,
                            top: { xxs: '16px', sm: '72px' },
                            paddingBottom: '12px',
                            background: (theme) =>
                                theme.palette.background.default,
                        }}
                    >
                        <Box sx={{ width: '100%' }}>
                            <Filter />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, calc(100% / ${cols} - 12px / ${cols} * ${cols - 1}))`,
                            gridTemplateRows: {
                                xxs: 'unset',
                                md: `repeat(${rows * 2}, calc(${boxHeight} / ${rows} - 12px / ${rows * 2} * ${rows * 2 - 1}))`,
                            },
                            gap: '12px',
                        }}
                    >
                        <Item
                            col={0.375}
                            row={1}
                            order={1}
                            display={settings.einnahmen}
                        >
                            <Chart
                                title="Einnahmen"
                                onClick={() => setFullscreen('Einnahmen')}
                                chart={<EinnahmenBarChart />}
                                sx={{ height: 'calc(100% - 12px - 15px)' }}
                            />
                        </Item>
                        <Item
                            col={0.25}
                            row={3 / 3}
                            order={2}
                            display={settings.stats}
                            sx={{ padding: '0 12px' }}
                        >
                            <Stats />
                        </Item>
                        <Item
                            col={0.375}
                            row={1}
                            order={3}
                            display={settings.gesamt}
                        >
                            <Chart
                                title="Gesamt"
                                onClick={() => setFullscreen('Gesamt')}
                                chart={<UmsatzBarChart />}
                                sx={{ height: 'calc(100% - 12px - 15px)' }}
                            />
                        </Item>

                        <Item
                            col={0.125}
                            row={2 / 3}
                            order={4}
                            display={settings.ausgabenTyp}
                        >
                            <Chart
                                title="Ausgaben nach Typ"
                                onClick={() =>
                                    setFullscreen('Ausgaben nach Typ')
                                }
                                chart={<AusgabenPieChart />}
                                sx={{ height: 'calc(100% - 12px - 20px)' }}
                            />
                        </Item>

                        <Item
                            col={0.375}
                            row={1}
                            order={5}
                            display={settings.ausgaben}
                        >
                            <Chart
                                title="Ausgaben"
                                onClick={() => setFullscreen('Ausgaben')}
                                chart={<AusgabenBarChart />}
                                sx={{ height: 'calc(100% - 12px - 15px)' }}
                            />
                        </Item>
                        <Item
                            col={0.375}
                            row={1}
                            order={6}
                            display={settings.ausgabenKategorie}
                        >
                            <Chart
                                title="Ausgaben je Kategorie"
                                onClick={() =>
                                    setFullscreen('Ausgaben je Kategorie')
                                }
                                chart={<AusgabenTreeMap />}
                                sx={{ height: 'calc(100% - 12px - 21px)' }}
                            />
                        </Item>
                        <Item
                            col={0.125}
                            row={1 / 2}
                            order={7}
                            display={false}
                            sx={{
                                background: (theme) =>
                                    theme.palette.primary.main,
                            }}
                        ></Item>
                        <Item
                            col={0.125}
                            row={1 / 3}
                            order={9}
                            display={true}
                            sx={{
                                background: (theme) =>
                                    theme.palette.primary.light,
                                borderColor: (theme) =>
                                    theme.palette.primary.light,
                            }}
                        >
                            {/* {!print && <Print />} */}
                        </Item>
                        <Item
                            col={0.125}
                            row={1 / 2}
                            order={!print ? 8 : 9}
                            display={settings.ausgabenTyp}
                        >
                            nicht gelistet
                        </Item>
                    </Box>
                    {!print && (
                        <Dialog
                            fullScreen
                            fullWidth
                            open={fullscreen}
                            onClose={() => setFullscreen('')}
                            content={
                                <>
                                    <AppBar
                                        enableColorOnDark
                                        sx={{
                                            position: 'relative',
                                            background: (theme) =>
                                                theme.palette.background
                                                    .default,
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                            borderBottom: (theme) =>
                                                `1px solid ${theme.palette.primary.main}`,
                                            boxShadow: 'none',
                                        }}
                                    >
                                        <Toolbar
                                            sx={{
                                                minHeight: '55.2px !important',
                                            }}
                                        >
                                            <Box sx={{ flexGrow: 1 }}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        setFullscreen('')
                                                    }
                                                    sx={{ marginLeft: -2 }}
                                                >
                                                    <Icon
                                                        path={mdiFullscreenExit}
                                                        size={1.4}
                                                    />
                                                </IconButton>
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                component="div"
                                            >
                                                {fullscreen}
                                            </Typography>
                                        </Toolbar>
                                    </AppBar>
                                    <Box
                                        sx={{
                                            height: 'calc(100vh - 56px - 2 * 24px)',
                                            padding: '24px',
                                            background: (theme) =>
                                                theme.palette.background
                                                    .default,
                                        }}
                                    >
                                        {charts[fullscreen]}
                                    </Box>
                                </>
                            }
                        />
                    )}
                </Box>
            )
        ) : (
            <Alert
                message={
                    <div>
                        Es werden aktuell keine Statistiken bzw. Grafiken
                        angezeigt, da dies in deinen Dashboard-Einstellungen
                        untersagt wird. Um dies zu verändern, erneuere deine{' '}
                        <Link to="/einstellungen" style={{ color: 'inherit' }}>
                            Einstellungen
                        </Link>
                        .
                    </div>
                }
                severity="info"
            />
        )
    ) : (
        <Loader />
    );
};

export default Dashboard;
