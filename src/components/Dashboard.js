import Filter from './Filter';
import EinnahmenBarChart from './EinnahmenBarChart';
import AusgabenBarChart from './AusgabenBarChart';
import UmsatzBarChart from './UmsatzBarChart';
import AusgabenPieChart from './AusgabenPieChart';
import AusgabenTreeMap from './AusgabenTreeMap';
import Stats from './Stats';
import { useSelector } from 'react-redux';
import {
    AppBar,
    Box,
    Grid,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Alert from './Alert';
import { Link } from 'react-router-dom';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';
import Icon from '@mdi/react';
import Dialog from './Dialog';
import { useState } from 'react';
import IconButton from './IconButton';
import Print from './Print';
import Loader from './Loader';

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
                    }}
                    onClick={onClick}
                >
                    <Icon path={mdiFullscreen} size={1} />
                </IconButton>
            )}
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
    const boxHeight = print
        ? '500px'
        : 'calc((100vh - (56px + 16px + 38px + 12px + 12px + 16px)) / 2 - 2 * 12px - 2px)'; //40vh',

    return init ? (
        !(downMedium && !Object.values(settings).includes(true)) ? (
            umsatzDf && (
                <Box id="dashboard">
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: 'calc(100% - 50px)' }}>
                            <Filter />
                        </Box>
                        {!print && <Print />}
                    </Box>
                    <Grid container spacing={1.5} sx={{ marginTop: '0px' }}>
                        <Grid
                            item
                            xxs={!print ? 12 : 4.5}
                            md={4.5}
                            order={{ xxs: !print ? 3 : 1, sm: 1 }}
                            sx={{
                                display: {
                                    xxs:
                                        settings.einnahmen || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: 'calc((100vh - 148px) / 2 - 2 * 12px - 2px)',
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '12px',
                                }}
                            >
                                <Title
                                    name="Einnahmen"
                                    onClick={() => setFullscreen('Einnahmen')}
                                    print={print}
                                />
                                <Box
                                    sx={{ height: 'calc(100% - 12px - 15px)' }}
                                >
                                    <EinnahmenBarChart />
                                </Box>
                            </Box>
                        </Grid>
                        <Grid
                            item
                            xxs={!print ? 12 : 3}
                            md={3}
                            order={{ xxs: !print ? 1 : 2, sm: 2 }}
                            sx={{
                                display: {
                                    xxs:
                                        settings.stats || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: `calc(${boxHeight} + 2 * 12px)`,
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '0 12px',
                                }}
                            >
                                <Stats />
                            </Box>
                        </Grid>
                        <Grid
                            item
                            xxs={!print ? 12 : 4.5}
                            md={4.5}
                            order={{ xxs: !print ? 2 : 3, sm: 3 }}
                            sx={{
                                display: {
                                    xxs:
                                        settings.gesamt || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: boxHeight,
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '12px',
                                }}
                            >
                                <Title
                                    name="Gesamt"
                                    onClick={() => setFullscreen('Gesamt')}
                                    print={print}
                                />
                                <Box
                                    sx={{ height: 'calc(100% - 12px - 15px)' }}
                                >
                                    <UmsatzBarChart />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1.5} sx={{ marginTop: '0px' }}>
                        <Grid
                            item
                            xxs={!print ? 12 : 4.5}
                            md={4.5}
                            order={3}
                            sx={{
                                display: {
                                    xxs:
                                        settings.ausgaben || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: boxHeight,
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '12px',
                                }}
                            >
                                <Title
                                    name="Ausgaben"
                                    onClick={() => setFullscreen('Ausgaben')}
                                    print={print}
                                />
                                <Box
                                    sx={{ height: 'calc(100% - 12px - 15px)' }}
                                >
                                    <AusgabenBarChart />
                                </Box>
                            </Box>
                        </Grid>
                        <Grid
                            item
                            xxs={!print ? 12 : 3}
                            md={3}
                            order={3}
                            sx={{
                                display: {
                                    xxs:
                                        settings.ausgabenTyp || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: boxHeight,
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '12px',
                                }}
                            >
                                <Title
                                    name="Ausgaben nach Typ"
                                    onClick={() =>
                                        setFullscreen('Ausgaben nach Typ')
                                    }
                                    print={print}
                                />
                                <Box
                                    sx={{ height: 'calc(100% - 12px - 20px)' }}
                                    id="AusgabenPieChart"
                                >
                                    <AusgabenPieChart />
                                </Box>
                            </Box>
                        </Grid>
                        <Grid
                            item
                            xxs={!print ? 12 : 4.5}
                            md={4.5}
                            order={3}
                            sx={{
                                display: {
                                    xxs:
                                        settings.ausgabenKategorie || print
                                            ? 'initial'
                                            : 'none',
                                    md: 'initial',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: boxHeight,
                                    border: (theme) =>
                                        `1px solid ${theme.palette.primary.main}`,
                                    padding: '12px',
                                }}
                            >
                                <Title
                                    name="Ausgaben je Kategorie"
                                    onClick={() =>
                                        setFullscreen('Ausgaben je Kategorie')
                                    }
                                    print={print}
                                />
                                <Box
                                    sx={{ height: 'calc(100% - 12px - 21px)' }}
                                    id="AusgabenTreeMap"
                                >
                                    <AusgabenTreeMap />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
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
                                            // background: (theme) =>
                                            //     theme.palette.mode === 'light'
                                            //         ? theme.palette.primary.main
                                            //         : theme.palette.primary.light,
                                            background: (theme) =>
                                                theme.palette.background
                                                    .default,
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                            borderBottom: (theme) =>
                                                `1px solid ${theme.palette.primary.main}`,
                                            boxShadow: 'none',
                                            // color: (theme) =>
                                            //     theme.palette.mode === 'light'
                                            //         ? theme.palette.getContrastText(
                                            //               theme.palette.primary.main
                                            //           )
                                            //         : theme.palette.getContrastText(
                                            //               theme.palette.primary.light
                                            //           ),
                                        }}
                                    >
                                        <Toolbar
                                            sx={{
                                                minHeight: '56px !important',
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
