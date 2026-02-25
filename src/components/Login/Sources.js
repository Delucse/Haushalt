import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { logout, setAuthType } from '../../actions/authActions';

import { useNavigate, useParams } from 'react-router-dom';

import { Box, Divider, Typography } from '@mui/material';

import Icon from '@mdi/react';
import { mdiFolderOpen, mdiArrowLeftThin, mdiPiggyBank } from '@mdi/js';

import { ReactComponent as FilenLogo } from '../../media/Filen_Logo.svg';
import { ReactComponent as FilenLogoName } from '../../media/Filen_Logo_Name.svg';
import { ReactComponent as DropboxLogo } from '../../media/Dropbox_Logo.svg';
import { ReactComponent as DropboxLogoName } from '../../media/Dropbox_Logo_Name.svg';

import Lokal from './Lokal';
import Filen from './Filen';
import Dropbox from './Dropbox';

const sources = {
    dropbox: {
        background: '#0061fe',
        prevIcon: (
            <DropboxLogoName style={{ height: '38.25px', width: 'auto' }} />
        ),
        icon: <DropboxLogo style={{ height: '47.26px', width: 'auto' }} />,
        component: <Dropbox />,
    },
    filen: {
        background: 'black',
        prevIcon: <FilenLogoName style={{ height: '30px', width: 'auto' }} />,
        icon: <FilenLogo style={{ height: '30px', width: 'auto' }} />,
        component: <Filen />,
    },
    lokal: {
        background: '#FFEBCD',
        color: '#800000',
        prevIcon: (
            <>
                <Icon path={mdiFolderOpen} size={1.413} color="#F4A460" />
                <span style={{ marginLeft: '5px' }}>Lokal</span>
            </>
        ),
        icon: <Icon path={mdiFolderOpen} size={1.413} color="#F4A460" />,
        component: <Lokal />,
    },
};

const Source = ({ active, preview, background, color, icon, set }) => {
    return (
        <Box
            sx={{
                background: background,
                opacity: active || preview ? 1 : 0.4,
                height: '100%',
                color: color,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                cursor: 'pointer',
                fontWeight: 'bold',
                gridColumnStart: 1,
                '&:hover': {
                    opacity: 1,
                },
            }}
            onClick={() => (preview || !active) && set()}
        >
            {icon}
        </Box>
    );
};

const Sources = ({ preview }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const source = useSelector((state) => state.auth.type);
    const token = useSelector((state) => state.auth.token);
    const sourceKeys = Object.keys(sources);

    useEffect(() => {
        dispatch(setAuthType(params.source));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (source !== null && source !== params.source) {
            navigate(`/quelle/${source}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source]);

    useEffect(() => {
        if (preview) {
            if (token) {
                dispatch(logout());
            } else {
                dispatch(setAuthType(null));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preview]);

    return (
        <Box
            sx={{ padding: '20px', maxWidth: { sm: '600px' }, margin: 'auto' }}
        >
            <Box sx={{ minHeight: '70px', display: 'flex' }}>
                <Box
                    sx={{
                        width: '80px',
                        marginRight: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: !preview && 'pointer',
                        gridColumnStart: 1,
                        color: (theme) => theme.palette.primary.light,
                        '&:hover': !preview && {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                    onClick={() => {
                        if (!preview) {
                            if (!!token) dispatch(logout);
                            navigate('/quelle');
                        }
                    }}
                >
                    <Icon
                        path={preview ? mdiPiggyBank : mdiArrowLeftThin}
                        size={preview ? 1.6 : 2}
                        style={{ marginRight: '5px' }}
                    />
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        color: (theme) => theme.palette.primary.main,
                        margin: 'auto 0',
                    }}
                >
                    Haushalt{' '}
                    <span style={{ fontFamily: 'LobsterTwo-Bold' }}>
                        Delucse
                    </span>
                </Typography>
            </Box>
            <Divider
                sx={{
                    marginBottom: '10px',
                    borderColor: (theme) => theme.palette.primary.main,
                }}
            />
            <Box
                sx={{
                    width: 'calc(100%)',
                    display: 'grid',
                    gridTemplateColumns: preview ? 'auto' : '80px auto',
                    gridTemplateRows: `repeat(${sourceKeys.length}, 80px)`,
                    columnGap: '10px',
                    rowGap: '10px',
                }}
            >
                {sourceKeys.map((s) => (
                    <Source
                        key={s}
                        active={source === s}
                        preview={preview}
                        set={() => {
                            if (!!token) dispatch(logout());
                            dispatch(setAuthType(s));
                        }}
                        background={sources[s].background}
                        color={sources[s].color}
                        icon={preview ? sources[s].prevIcon : sources[s].icon}
                    />
                ))}
                {!preview && (
                    <Box
                        sx={{
                            gridColumnStart: 2,
                            gridRowStart: 1,
                            gridRowEnd: sourceKeys.length + 1,
                        }}
                    >
                        {sources[source]?.component}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Sources;
