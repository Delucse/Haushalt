import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginFilen, setAuthType } from '../actions/authActions';
import { useNavigate } from 'react-router-dom';
import { resetMessage } from '../actions/messageActions';
import {
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
    Typography,
} from '@mui/material';
import FilenSDK from '@filen/sdk';
import { setFilesFilen } from '../actions/fileActions';
import Alert from './Alert';
import Textfield from './Textfield';
import Button from './Button';
import IconButton from './IconButton';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiFolderOpenOutline } from '@mdi/js';
import moment from 'moment';
import Loader from './Loader';

const Login = () => {
    const [cloud, setCloud] = useState(null);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [tree, setTree] = useState(null);

    const passwordRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const error = useSelector((state) => state.message.error);
    const token = useSelector((state) => state.auth.token);
    const isAuthenticated = token && Object.keys(token).length > 0;
    const progress = useSelector((state) => state.auth.progress);
    const init = useSelector((state) => state.dataframe.progress);

    useEffect(() => {
        isAuthenticated &&
            /*uuid &&*/
            init === false &&
            !error &&
            navigate('/dashboard', {
                replace: true,
                state: { timestamp: moment().valueOf() },
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [init, error]);

    useEffect(() => {
        if (isAuthenticated)
            switch (cloud) {
                case 'filen':
                    const t = async () => {
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
                    t();
                    break;
                default:
                    break;
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

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

    const renderTree = (item, level = 0) => (
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

    return init === null || error ? (
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
                    Haushalt Delucse
                </Typography>
                <Divider
                    sx={{
                        margin: '20px 0',
                        borderColor: (theme) => theme.palette.primary.main,
                    }}
                />
                {!cloud ? (
                    <div>
                        <Alert
                            severity="info"
                            message={
                                'Zukünftig sollen noch weitere Cloud-Anbieter verfügbar gemacht werden.'
                            }
                            style={{ marginBottom: '20px' }}
                        />
                        <Box
                            sx={{
                                background: 'black',
                                height: '80px',
                                widht: '100%',
                                borderRadius: '20px',
                                color: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                border: (theme) =>
                                    `1px solid ${theme.palette.text.primary}`,
                            }}
                            onClick={() => setCloud('filen')}
                        >
                            Filen
                        </Box>
                        {/* <div
                            style={{
                                background: 'darkblue',
                                height: '80px',
                                widht: '100%',
                                borderRadius: '20px',
                                color: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                marginBottom: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCloud('dropbox')}
                        >
                            Dropbox
                        </div> */}
                    </div>
                ) : !isAuthenticated || !tree ? (
                    <div
                        style={{
                            display: 'grid',
                        }}
                    >
                        <Alert
                            type={['user']}
                            style={{ marginBottom: '20px' }}
                        />
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
                                    dispatch(setAuthType('filen'));
                                    dispatch(loginFilen(user, password));
                                }
                            }}
                            end={
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    sx={{
                                        '&:hover': {
                                            color: (theme) =>
                                                theme.palette.primary.main,
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
                                    dispatch(setAuthType('filen'));
                                    dispatch(loginFilen(user, password));
                                }}
                                disabled={progress}
                            >
                                {!progress ? (
                                    'Anmelden'
                                ) : (
                                    <CircularProgress size={24.5} />
                                )}
                            </Button>
                        </p>
                    </div>
                ) : (
                    tree && (
                        <>
                            <Alert
                                type={'tree'}
                                style={{ marginBottom: '20px' }}
                            />
                            <List disablePadding>{renderTree(tree)}</List>
                        </>
                    )
                )}
            </Box>
        </Box>
    ) : (
        <Loader />
    );
};

export default Login;
