import { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FilenSDK from '@filen/sdk';
import moment from 'moment';
import Icon from '@mdi/react';
import {
    mdiEye,
    mdiEyeOff,
    mdiFolderOpenOutline,
    mdiFolderOpen,
} from '@mdi/js';
import {
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
    Typography,
} from '@mui/material';

import { loginFilen, setAuthType } from '../actions/authActions';
import { resetMessage } from '../actions/messageActions';
import { setFilesFilen, setFilesLocale } from '../actions/fileActions';

import Alert from './Alert';
import Textfield from './Textfield';
import Button from './Button';
import IconButton from './IconButton';
import Loader from './Loader';

import { ReactComponent as FilenLogo } from '../media/Filen_Logo.svg';
import { ReactComponent as DropboxLogo } from '../media/Dropbox_Logo.svg';

const CloudLogin = ({ cloud }) => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const progress = useSelector((state) => state.auth.progress);
    const error = useSelector((state) => state.message.error);
    const dispatch = useDispatch();

    const passwordRef = useRef();

    useEffect(() => {
        if (error) {
            dispatch(resetMessage());
        }
        return () => {
            if (error) {
                dispatch(resetMessage());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, password]);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    };

    return (
        <div
            style={{
                display: 'grid',
            }}
        >
            <Alert type={['user']} style={{ marginBottom: '20px' }} />
            <Textfield
                placeholder="Nutzername"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        passwordRef.current.focus();
                    }
                }}
                fullWidth
                margin
                autoFocus
            />
            <Textfield
                inputRef={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !progress) {
                        dispatch(setAuthType(cloud));
                        switch (cloud) {
                            case 'filen':
                                dispatch(loginFilen(user, password));
                                break;
                            default:
                                break;
                        }
                    }
                }}
                end={
                    <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        sx={{
                            '&:hover': {
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                    >
                        <Icon
                            path={showPassword ? mdiEyeOff : mdiEye}
                            size={1}
                        />
                    </IconButton>
                }
                fullWidth
            />
            <p style={{ marginTop: '20px' }}>
                <Button
                    variant="contained"
                    sx={{ width: '100%' }}
                    onClick={() => {
                        dispatch(setAuthType(cloud));
                        switch (cloud) {
                            case 'filen':
                                dispatch(loginFilen(user, password));
                                break;
                            default:
                                break;
                        }
                    }}
                    disabled={progress}
                >
                    {!progress ? 'Anmelden' : <CircularProgress size={24.5} />}
                </Button>
            </p>
        </div>
    );
};

const Source = () => {
    const [source, setSource] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const error = useSelector((state) => state.message.error);
    const token = useSelector((state) => state.auth.token);
    const type = useSelector((state) => state.auth.type);
    const init = useSelector((state) => state.dataframe.progress);
    const isAuthenticated = token && Object.keys(token).length > 0;

    useEffect(() => {
        if (
            (isAuthenticated || type === 'locale') &&
            init === false &&
            !error
        ) {
            navigate('/dashboard', {
                replace: true,
                state: { timestamp: moment().valueOf() },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init, error]);

    useEffect(() => {
        if (init && source === 'locale') {
            setSource(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init]);

    return init === null || error || source === 'locale' ? (
        <Box
            sx={{
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                height: 'calc(100vh - 2 * 30px)',
                padding: '30px',
                background: (theme) => theme.palette.background.default,
            }}
        >
            <Box
                sx={{
                    padding: '20px',
                    border: (theme) =>
                        `3px solid ${theme.palette.primary.main}`,
                    width: '100%',
                    maxWidth: '300px',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    Haushalt{' '}
                    <span style={{ fontFamily: 'LobsterTwo-Bold' }}>
                        Delucse
                    </span>
                </Typography>
                <Divider
                    sx={{
                        margin: '20px 0',
                        borderColor: (theme) => theme.palette.primary.main,
                    }}
                />
                {!source || source === 'locale' ? (
                    <div>
                        <Alert
                            severity="info"
                            message={
                                'Zukünftig werden weitere Cloud-Anbieter zur Auswahl stehen.'
                            }
                            style={{ marginBottom: '10px' }}
                        />
                        {/* <Box
                            sx={{
                                background: '#0061fe',
                                height: '80px',
                                width: '100%',
                                color: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                marginBottom: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => setSource('dropbox')}
                        >
                            <DropboxLogo style={{ height: '30px' }} />
                        </Box> */}
                        <Box
                            sx={{
                                background: 'black',
                                height: '80px',
                                width: '100%',
                                color: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                marginBottom: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => setSource('filen')}
                        >
                            <FilenLogo style={{ height: '30px' }} />
                        </Box>
                        <Box
                            sx={{
                                background: '#FFEBCD',
                                height: '80px',
                                width: '100%',
                                color: '#800000',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                // marginBottom: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                            onClick={() => {
                                setSource('locale');
                                dispatch(setFilesLocale());
                            }}
                        >
                            <Icon
                                path={mdiFolderOpen}
                                size={1.4}
                                style={{ marginRight: '5px', color: '#F4A460' }}
                            />{' '}
                            Lokal
                        </Box>
                    </div>
                ) : !isAuthenticated ? (
                    <CloudLogin cloud={source} />
                ) : (
                    <CloudFolderTree cloud={source} token={token} />
                )}
            </Box>
        </Box>
    ) : (
        <Loader />
    );
};

const CloudFolderTree = ({ cloud, token }) => {
    const [tree, setTree] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        var directories = () => {};
        switch (cloud) {
            case 'filen':
                directories = async () => {
                    const filen = new FilenSDK({
                        metadataCache: true, // Cache decrypted metadata in memory. Recommended.
                        connectToSocket: false, // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
                        ...token,
                    });
                    // https://github.com/FilenCloudDienste/filen-sdk-ts/blob/00247846f311ac6916c7bcc9a9498ed17119493b/src/cloud/index.ts#L3222C15-L3222C31
                    const items = await filen.cloud().getDirectoryTree({
                        uuid: token.baseFolderUUID,
                    });
                    var folders = Object.values(items).filter(
                        (item) => item.type === 'directory'
                    );
                    setTree(filenDirectories(folders[0], folders)[0]);
                };
                break;
            default:
                break;
        }
        directories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filenDirectories = (folder, folders, directories = []) => {
        if (folders.length > 0) {
            const children = folders
                .filter((f) => f.parent === folder.uuid)
                .sort((a, b) => a.name > b.name);
            folders = folders.filter((f) => f.parent !== folder.uuid);
            var childs = [];
            if (children.length > 0) {
                children.forEach((child) => {
                    childs.concat(filenDirectories(child, folders, childs));
                });
            }
            directories.push({
                uuid: folder.uuid,
                name: folder.name,
                children: childs,
            });
        }
        return directories;
    };

    const renderTree = (item, level = 0) => {
        return (
            <Box key={item.uuid}>
                <ListItemButton
                    onClick={() => dispatch(setFilesFilen(item.uuid))}
                    sx={{
                        padding: '8px 12px',
                        marginLeft: `${level * 30}px`,
                        color: (theme) => theme.palette.text.secondary,
                        '&:hover': {
                            color: (theme) => theme.palette.secondary.main,
                        },
                    }}
                >
                    <Icon
                        path={mdiFolderOpenOutline}
                        size={1}
                        style={{ color: 'inherit', marginRight: '10px' }}
                    />
                    {item.name}
                </ListItemButton>
                {item.children && (
                    <Divider sx={{ marginLeft: `${level * 30}px` }} />
                )}
                {Array.isArray(item.children)
                    ? item.children.map((i) => renderTree(i, level + 1))
                    : null}
            </Box>
        );
    };

    return (
        tree && (
            <>
                <Alert type={'tree'} style={{ marginBottom: '20px' }} />
                <List disablePadding>{renderTree(tree)}</List>
            </>
        )
    );
};

export default Source;
