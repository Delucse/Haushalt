import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Tabs,
    Tab as MuiTab,
} from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Icon from '@mdi/react';
import {
    mdiChartArc,
    mdiCogOutline,
    mdiDatabasePlus,
    mdiHomeExportOutline,
    mdiHomeImportOutline,
    mdiMagnify,
} from '@mdi/js';
import AddUmbuchung from './AddUmbuchung';
import { useEffect, useState } from 'react';
import AddAbschluss from './AddAbschluss';
import AddUmsatz from './AddUmsatz';
import Toast from './Toast';
import Save from './Save';
import { useDispatch, useSelector } from 'react-redux';
import Prompt from './Prompt';
import { logout } from '../actions/authActions';
import IconButton from './IconButton';

const Nav = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const dispatch = useDispatch();

    const simple = useSelector((state) => state.settings.simple);
    const isAuthenticated = useSelector(
        (state) => state.auth.token || state.auth.type === 'lokal',
    );

    const [umsatzOpen, setUmsatzOpen] = useState(false);
    const [abschlussOpen, setAbschlussOpen] = useState(false);
    const [umbuchungOpen, setUmbuchungOpen] = useState(false);
    const [anchorSearch, setAnchorSearch] = useState(null);
    const [anchorAdd, setAnchorAdd] = useState(null);
    const searchOpen = Boolean(anchorSearch);
    const addOpen = Boolean(anchorAdd);

    return isAuthenticated ? (
        <>
            <IconButton
                color="inherit"
                onClick={
                    simple
                        ? () => setUmsatzOpen(true)
                        : (event) => setAnchorAdd(event.currentTarget)
                }
            >
                <Icon path={mdiDatabasePlus} size={1.4} />
            </IconButton>
            <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard')}
                disabled={pathname === '/dashboard'}
            >
                <Icon path={mdiChartArc} size={1.4} />
            </IconButton>
            <IconButton
                color="inherit"
                onClick={
                    simple
                        ? () => navigate('/umsatz')
                        : (event) => setAnchorSearch(event.currentTarget)
                }
                sx={{
                    color:
                        pathname === '/umsatz' ||
                        pathname === '/abschluss' ||
                        pathname === '/umbuchung'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'inherit',
                }}
            >
                <Icon path={mdiMagnify} size={1.4} />
            </IconButton>
            <IconButton
                color="inherit"
                onClick={() => navigate('/einstellungen')}
                disabled={
                    pathname === '/einstellungen' ||
                    pathname === '/kategorien' ||
                    pathname === '/umsatz/wiederkehrend'
                }
            >
                <Icon path={mdiCogOutline} size={1.4} />
            </IconButton>
            <IconButton color="inherit" onClick={() => dispatch(logout())}>
                <Icon path={mdiHomeExportOutline} size={1.4} />
            </IconButton>
            <AddUmsatz
                open={umsatzOpen}
                onClose={() => setUmsatzOpen(false)}
                art={'Ausgabe'}
                betrag={''}
                typ={'variabel'}
                kategorie={''}
                beschreibung={''}
                bemerkung={''}
                tags={[]}
            />
            {!simple && (
                <>
                    <Menu
                        anchorEl={anchorAdd}
                        open={addOpen}
                        onClose={() => setAnchorAdd(null)}
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: 0,
                                },
                            },
                            list: {
                                sx: { padding: 0 },
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                setUmsatzOpen(true);
                                setAnchorAdd(null);
                            }}
                        >
                            Umsatz
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAbschlussOpen(true);
                                setAnchorAdd(null);
                            }}
                        >
                            Abschluss
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setUmbuchungOpen(true);
                                setAnchorAdd(null);
                            }}
                        >
                            Umbuchung
                        </MenuItem>
                    </Menu>
                    <Menu
                        anchorEl={anchorSearch}
                        open={searchOpen}
                        onClose={() => setAnchorSearch(null)}
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: 0,
                                },
                            },
                            list: {
                                sx: { padding: 0 },
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                navigate('/umsatz');
                                setAnchorSearch(null);
                            }}
                            disabled={pathname === '/umsatz'}
                        >
                            Umsatz
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                navigate('/abschluss');
                                setAnchorSearch(null);
                            }}
                            disabled={pathname === '/abschluss'}
                        >
                            Abschluss
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                navigate('/umbuchung');
                                setAnchorSearch(null);
                            }}
                            disabled={pathname === '/umbuchung'}
                        >
                            Umbuchung
                        </MenuItem>
                    </Menu>
                    <AddAbschluss
                        open={abschlussOpen}
                        onClose={() => setAbschlussOpen(false)}
                        konto={''}
                        bargeld={''}
                    />
                    <AddUmbuchung
                        open={umbuchungOpen}
                        onClose={() => setUmbuchungOpen(false)}
                        betrag={''}
                        bemerkung={''}
                    />
                </>
            )}
        </>
    ) : (
        <Box
            style={{
                width: { xxs: '100%', sm: 'inherit' },
                justifyContent: 'end',
                display: 'flex',
            }}
        >
            <IconButton color="inherit" onClick={() => navigate('/')}>
                <Icon path={mdiHomeImportOutline} size={1.4} />
            </IconButton>
        </Box>
    );
};

const Tab = ({ value }) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(
        (state) => state.auth.token || state.auth.type === 'lokal',
    );

    return (
        <Tabs
            value={value}
            onChange={(event, newValue) => navigate(newValue)}
            sx={{
                position: 'sticky',
                top: { xxs: 0, sm: '56px' },
                zIndex: 1,
                background: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                '.MuiTabs-indicator': {
                    background: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                },
                '.Mui-selected': {
                    color: (theme) =>
                        theme.palette.mode === 'light'
                            ? `${theme.palette.primary.main} !important`
                            : `${theme.palette.text.primary} !important`,
                },
            }}
            variant="fullWidth"
        >
            <MuiTab
                value="/einstellungen"
                label="Einstellungen"
                sx={{
                    color: (theme) =>
                        theme.palette.mode === 'light'
                            ? `${theme.palette.primary.main}99`
                            : `${theme.palette.primary.light}99`,
                }}
            />
            {isAuthenticated && (
                <MuiTab
                    value="/kategorien"
                    label="Kategorien"
                    sx={{
                        color: (theme) =>
                            theme.palette.mode === 'light'
                                ? `${theme.palette.primary.main}99`
                                : `${theme.palette.primary.light}99`,
                    }}
                />
            )}
            {isAuthenticated && (
                <MuiTab
                    value="/umsatz/wiederkehrend"
                    label="wiederkehrende Posten"
                    sx={{
                        color: (theme) =>
                            theme.palette.mode === 'light'
                                ? `${theme.palette.primary.main}99`
                                : `${theme.palette.primary.light}99`,
                    }}
                />
            )}
            <MuiTab
                value="/faq"
                label="FAQ"
                sx={{
                    color: (theme) =>
                        theme.palette.mode === 'light'
                            ? `${theme.palette.primary.main}99`
                            : `${theme.palette.primary.light}99`,
                }}
            />
        </Tabs>
    );
};

const Layout = () => {
    const { pathname } = useLocation();
    const isTab = [
        '/einstellungen',
        '/kategorien',
        '/umsatz/wiederkehrend',
        '/faq',
    ].includes(pathname);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            {pathname === '/' || pathname.startsWith('/quelle') ? (
                <Box
                    sx={{
                        minHeight: '100vh',
                        background: (theme) => theme.palette.background.default,
                    }}
                >
                    <Outlet />
                </Box>
            ) : (
                <>
                    <AppBar
                        position="sticky"
                        enableColorOnDark
                        sx={{
                            display: { xxs: 'none', sm: 'inherit' },
                            background: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.primary.main
                                    : theme.palette.primary.light,
                            color: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.getContrastText(
                                          theme.palette.primary.main,
                                      )
                                    : theme.palette.getContrastText(
                                          theme.palette.primary.light,
                                      ),
                        }}
                    >
                        <Toolbar sx={{ minHeight: '56px !important' }}>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{ flexGrow: 1, fontWeight: 400 }}
                            >
                                Haushalt{' '}
                                <span style={{ fontFamily: 'LobsterTwo-Bold' }}>
                                    Delucse
                                </span>
                            </Typography>
                            <Nav />
                        </Toolbar>
                    </AppBar>
                    {isTab && <Tab value={pathname} />}
                    <Box
                        sx={{
                            p: 2,
                            minHeight: `calc(100vh - 56px${
                                isTab ? ' - 59px' : ''
                            } - 2 * 16px - 0px)`,
                            background: (theme) =>
                                theme.palette.background.default,
                        }}
                    >
                        <Outlet />
                    </Box>
                    <AppBar
                        position="sticky"
                        enableColorOnDark
                        sx={{
                            display: { xxs: 'inherit', sm: 'none' },
                            bottom: 0,
                            top: 'unset',
                            background: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.primary.main
                                    : theme.palette.primary.light,
                            color: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.getContrastText(
                                          theme.palette.primary.main,
                                      )
                                    : theme.palette.getContrastText(
                                          theme.palette.primary.light,
                                      ),
                        }}
                    >
                        <Toolbar sx={{ justifyContent: 'space-between' }}>
                            <Nav />
                        </Toolbar>
                    </AppBar>
                    <Save />
                    <Prompt />
                </>
            )}
            <Toast />
        </>
    );
};

export default Layout;
