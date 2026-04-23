import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { Route, Routes } from 'react-router-dom';

import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { DialogsProvider } from '@toolpad/core/useDialogs';

import moment from 'moment';
import 'moment/locale/de';

import { Chart as ChartJS, TimeSeriesScale, BarElement } from 'chart.js';
import 'chartjs-adapter-moment';

import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Sources from './components/Login/Sources';
import Layout from './components/Layout';
import UmsatzTable from './components/UmsatzTable';
import Einstellungen from './components/Einstellungen';
import Kategorien from './components/Kategorien';
import WiederkehrenderUmsatz from './components/wiederkehrenderUmsatz';
import AbschlussTable from './components/AbschlussTable';
import UmbuchungTable from './components/UmbuchungTable';
import Faq from './components/Faq';
import NotFound from './components/NotFound';

ChartJS.register(BarElement, TimeSeriesScale);
moment.locale('de');

function App() {
    const theme = useSelector((state) => state.settings.theme);

    useEffect(() => {
        document.body.style.setProperty('--main', theme.color.main);
        document.body.style.setProperty('--light', theme.color.light);
    }, [theme.color]);

    const systemModeIsDark = useMediaQuery('(prefers-color-scheme: dark)');
    const mode =
        theme.mode === 'system'
            ? systemModeIsDark
                ? 'dark'
                : 'light'
            : theme.mode;

    const themeConfig = {
        palette: {
            primary: {
                main: mode === 'light' ? theme.color.main : theme.color.light,
                light: mode === 'light' ? theme.color.light : theme.color.main,
            },
            secondary: {
                main: theme.color.start,
                light: theme.color.end,
            },
            mode: mode,
        },
        breakpoints: {
            values: {
                xxs: 0,
                xs: 300,
                sm: 600,
                md: 900,
                lg: 1200,
                xl: 1536,
            },
        },
    };
    const muiTheme = createTheme(themeConfig);

    return (
        <ThemeProvider theme={muiTheme} noSsr>
            <DialogsProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Sources preview />} />
                        <Route path="/quelle">
                            <Route index element={<Sources preview />} />
                            <Route path=":source" element={<Sources />} />
                        </Route>
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/umsatz"
                            element={
                                <PrivateRoute>
                                    <UmsatzTable />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/abschluss"
                            element={
                                <PrivateRoute>
                                    <AbschlussTable />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/umbuchung"
                            element={
                                <PrivateRoute>
                                    <UmbuchungTable />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/einstellungen"
                            element={<Einstellungen />}
                        />
                        <Route
                            path="/kategorien"
                            element={
                                <PrivateRoute>
                                    <Kategorien />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/umsatz/wiederkehrend"
                            element={
                                <PrivateRoute>
                                    <WiederkehrenderUmsatz />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/faq" element={<Faq />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </DialogsProvider>
        </ThemeProvider>
    );
}

export default App;
