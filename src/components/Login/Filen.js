import { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { loginFilen, setAuthType } from '../../actions/authActions';
import { setFilesFilen } from '../../actions/fileActions';
import { resetMessage } from '../../actions/messageActions';

import { useNavigate } from 'react-router-dom';

import FilenSDK from '@filen/sdk';

import moment from 'moment';

import {
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
} from '@mui/material';

import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff, mdiFolderOpenOutline } from '@mdi/js';

import Alert from '../Alert';
import Textfield from '../Textfield';
import IconButton from '../IconButton';
import Button from '../Button';
import Loader from '../Loader';

const Login = () => {
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
                        dispatch(setAuthType('filen'));
                        dispatch(loginFilen(user, password));
                    }}
                    disabled={progress}
                >
                    {!progress ? (
                        'bei Filen Anmelden'
                    ) : (
                        <CircularProgress size={24.5} />
                    )}
                </Button>
            </p>
        </div>
    );
};

const FolderTree = ({ token }) => {
    const [tree, setTree] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        const directories = async () => {
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
                (item) => item.type === 'directory',
            );
            setTree(filenDirectories(folders[0], folders)[0]);
        };
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

const Filen = () => {
    const navigate = useNavigate();

    const token = useSelector((state) => state.auth.token);
    const progress = useSelector((state) => state.dataframe.progress);
    const error = useSelector((state) => state.message.error);

    useEffect(() => {
        if (progress === false && !error) {
            navigate('/dashboard', {
                replace: true,
                state: { timestamp: moment().valueOf() },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress, error]);

    return progress === null ? (
        !token ? (
            <Login />
        ) : (
            <FolderTree token={token} />
        )
    ) : (
        <Loader />
    );
};

export default Filen;
