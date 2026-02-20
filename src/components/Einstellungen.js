import { Box, ButtonGroup, Popover, Stack, Typography } from '@mui/material';
import Button from './Button';
import Switch from './Switch';
import Radio from './Radio';
import Alert from './Alert';
import {
    reset,
    setAutoSave,
    setColor,
    setDashboard,
    setMode,
    setSimple,
} from '../actions/settingActions';
import { useDispatch, useSelector } from 'react-redux';
import Help from '../components/Help';
import { useState } from 'react';
import { ChromePicker } from 'react-color';
import generateColor from '../utils/color';
import IconButton from './IconButton';
import Icon from '@mdi/react';
import { mdiRestore } from '@mdi/js';

const Dashboard = () => {
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.settings.dashboard);

    return (
        <Box sx={{ display: { xxs: 'grid', sm: 'grid' } }}>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    display: 'flex',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Dashboard-Anzeige
            </Typography>
            <Switch
                label="Statistiken"
                checked={settings.stats}
                onChange={(e) =>
                    dispatch(setDashboard('stats', e.target.checked))
                }
            />
            <Switch
                label="Gesamt"
                checked={settings.gesamt}
                onChange={(e) =>
                    dispatch(setDashboard('gesamt', e.target.checked))
                }
            />
            <Switch
                label="Einnahmen"
                checked={settings.einnahmen}
                onChange={(e) =>
                    dispatch(setDashboard('einnahmen', e.target.checked))
                }
            />
            <Switch
                label="Ausgaben"
                checked={settings.ausgaben}
                onChange={(e) =>
                    dispatch(setDashboard('ausgaben', e.target.checked))
                }
            />
            <Switch
                label="Ausgaben nach Typ"
                checked={settings.ausgabenTyp}
                onChange={(e) =>
                    dispatch(setDashboard('ausgabenTyp', e.target.checked))
                }
            />
            <Switch
                label="Ausgaben je Kategorie"
                checked={settings.ausgabenKategorie}
                onChange={(e) =>
                    dispatch(
                        setDashboard('ausgabenKategorie', e.target.checked),
                    )
                }
            />
        </Box>
    );
};

const rgbaToRgb = (rgb, alpha) => {
    return {
        r: parseInt((1 - alpha) * 255 + alpha * rgb.r),
        g: parseInt((1 - alpha) * 255 + alpha * rgb.g),
        b: parseInt((1 - alpha) * 255 + alpha * rgb.b),
    };
};

const rgbToHex = ({ r, g, b }) => {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    return '#' + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0');
};

const Theme = () => {
    const dispatch = useDispatch();

    const { color, mode } = useSelector((state) => state.settings.theme);
    const [anchorEl, setAnchorEl] = useState(null);
    const [colorType, setColorType] = useState(null);

    return (
        <Box>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    display: 'flex',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Modus
                <Help
                    explanation={
                        <div>
                            "Light" beschreibt ein helles Thema mit weißem
                            Hintergrund.
                            <br />
                            "Dark" meint ein dunkles Thema mit dunkelgrauem
                            Hintergrund.
                            <br />
                            "System" bezieht sich auf die Einstellung des gerade
                            genutzen Gerätes und kann daher sowohl "Light" als
                            auch "Dark" sein.
                        </div>
                    }
                />
            </Typography>
            <ButtonGroup variant="outlined" sx={{ marginBottom: '20px' }}>
                <Button
                    onClick={() => dispatch(setMode('light'))}
                    sx={{
                        background: (theme) =>
                            mode === 'light'
                                ? theme.palette.primary.main
                                : 'inherit',
                        color: (theme) =>
                            mode === 'light'
                                ? theme.palette.primary.contrastText
                                : theme.palette.primary.main,
                        '&:hover': {
                            background: (theme) => theme.palette.primary.main,
                            color: (theme) =>
                                theme.palette.primary.contrastText,
                        },
                    }}
                >
                    Light
                </Button>
                <Button
                    onClick={() => dispatch(setMode('system'))}
                    sx={{
                        background: (theme) =>
                            mode === 'system'
                                ? theme.palette.primary.main
                                : 'inherit',
                        color: (theme) =>
                            mode === 'system'
                                ? theme.palette.primary.contrastText
                                : theme.palette.primary.main,
                        '&:hover': {
                            background: (theme) => theme.palette.primary.main,
                            color: (theme) =>
                                theme.palette.primary.contrastText,
                        },
                    }}
                >
                    System
                </Button>
                <Button
                    onClick={() => dispatch(setMode('dark'))}
                    sx={{
                        background: (theme) =>
                            mode === 'dark'
                                ? theme.palette.primary.main
                                : 'inherit',
                        color: (theme) =>
                            mode === 'dark'
                                ? theme.palette.primary.contrastText
                                : theme.palette.primary.main,
                        '&:hover': {
                            background: (theme) => theme.palette.primary.main,
                            color: (theme) =>
                                theme.palette.primary.contrastText,
                        },
                    }}
                >
                    Dark
                </Button>
            </ButtonGroup>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    display: 'flex',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Navigation-Farbschema
                <Help explanation="Mit einem Klick auf die unteren Farbkachel lässt sich die Hauptfarbe der Navigation anpassen. Auf Grundlage der gewählten Hauptfarbe wird automatisch eine stimmige hellere Farbe berechnet." />
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    width: 'max-content',
                    marginBottom: '20px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        padding: 1.5,
                        border: (theme) =>
                            `1px solid ${theme.palette.text.primary}`,
                    }}
                >
                    <Box
                        onClick={(e) => {
                            setColorType('main');
                            setAnchorEl(e.currentTarget);
                        }}
                        sx={{ cursor: 'pointer', display: 'flex' }}
                    >
                        <Box
                            sx={{
                                backgroundColor: color.main,
                                width: '50px',
                                height: '50px',
                                textAlign: 'center',
                                lineHeight: '50px',
                            }}
                        />
                        <Box
                            sx={{
                                backgroundColor: color.light,
                                marginLeft: '2px',
                                width: '50px',
                                height: '50px',
                                textAlign: 'center',
                                lineHeight: '50px',
                            }}
                        />
                    </Box>
                    <IconButton
                        sx={{ marginLeft: 1.5 }}
                        onClick={() =>
                            dispatch(
                                setColor({
                                    main: '#006400',
                                    light: '#7fb17f',
                                }),
                            )
                        }
                    >
                        <Icon path={mdiRestore} size={1.4} />
                    </IconButton>
                </Box>
            </Box>
            <Typography
                component="div"
                variant="body1"
                sx={{
                    display: 'flex',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                Grafik-Farbschema
                <Help explanation="Mit einem Klick auf die jeweils äußere Farbkachel lässt sich der Farbgradient anpassen. Dieser dient als Farbgebung für die Grafiken im Dashboard." />
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    width: 'max-content',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        padding: 1.5,
                        border: (theme) =>
                            `1px solid ${theme.palette.text.primary}`,
                    }}
                >
                    {[
                        color.start,
                        ...generateColor(color.end, color.start, 8),
                    ].map((c, i) => {
                        const startEnd = i === 0 || i === 8;
                        return (
                            <Box
                                key={i}
                                sx={{
                                    backgroundColor: c,
                                    marginLeft: i === 1 ? '2px' : 0,
                                    marginRight: i === 7 ? '2px' : 0,
                                    width: startEnd
                                        ? '50px'
                                        : 'min(calc((100vw - 2 * 16px - 2 * 12px - 2 * 50px - 2 * 1px - 46px) / 8), 35px)',
                                    height: '50px',
                                    textAlign: 'center',
                                    lineHeight: '50px',
                                    cursor: startEnd ? 'pointer' : 'inherit',
                                }}
                                onClick={
                                    startEnd
                                        ? (e) => {
                                              setColorType(
                                                  i === 0 ? 'start' : 'end',
                                              );
                                              setAnchorEl(e.currentTarget);
                                          }
                                        : null
                                }
                            />
                        );
                    })}
                    <IconButton
                        sx={{ marginLeft: 1.5 }}
                        onClick={() =>
                            dispatch(
                                setColor({
                                    start: '#ff5722',
                                    end: '#ffcc80',
                                }),
                            )
                        }
                    >
                        <Icon path={mdiRestore} size={1.4} />
                    </IconButton>
                </Box>
            </Box>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { borderRadius: 0 },
                }}
            >
                <ChromePicker
                    disableAlpha={true}
                    color={color[colorType]}
                    onChange={(color) =>
                        colorType === 'main'
                            ? dispatch(
                                  setColor({
                                      main: color.hex,
                                      light: rgbToHex(
                                          rgbaToRgb(color.rgb, 0.5),
                                      ),
                                  }),
                              )
                            : dispatch(
                                  setColor({
                                      [colorType]: color.hex,
                                  }),
                              )
                    }
                />
            </Popover>
        </Box>
    );
};

const Einstellungen = () => {
    const dispatch = useDispatch();
    const saveSetting = useSelector((state) => state.settings.autoSave);
    const simpleSetting = useSelector((state) => state.settings.simple);
    const authType = useSelector((state) => state.auth.type);
    const isAuthenticated = useSelector(
        (state) => state.auth.token || authType === 'lokal',
    );

    return (
        <Box>
            <Stack spacing={'20px'}>
                <Alert
                    severity="info"
                    message="Die nachfolgenden Einstellungen werden lediglich lokal im Browser gespeichert."
                />
                {isAuthenticated && (
                    <>
                        <Dashboard />
                        <Box>
                            <Typography
                                component="div"
                                variant="body1"
                                sx={{
                                    display: 'flex',
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                Speicherung
                            </Typography>
                            <Radio
                                value={saveSetting}
                                onChange={(e) =>
                                    dispatch(setAutoSave(e.target.value))
                                }
                                disabled={authType === 'lokal'}
                                row
                                options={[
                                    { value: true, label: 'automatisch' },
                                    { value: false, label: 'manuell' },
                                ]}
                            />
                        </Box>
                        <Box>
                            <Typography
                                component="div"
                                variant="body1"
                                sx={{
                                    display: 'flex',
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                Anwendung
                            </Typography>
                            <Radio
                                value={simpleSetting}
                                onChange={(e) =>
                                    dispatch(setSimple(e.target.value))
                                }
                                row
                                options={[
                                    { value: true, label: 'vereinfacht' },
                                    { value: false, label: 'vollumfänglich' },
                                ]}
                            />
                        </Box>
                    </>
                )}
                <Theme />
                {isAuthenticated && (
                    <Button
                        variant="outlined"
                        onClick={() => dispatch(reset())}
                    >
                        Einstellungen zurücksetzen
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

export default Einstellungen;
