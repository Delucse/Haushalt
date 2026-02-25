import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { loginDropbox } from '../../actions/authActions';
import { alertErrorMessage } from '../../actions/messageActions';
import { setFilesDropbox } from '../../actions/fileActions';

import { useNavigate, useSearchParams } from 'react-router-dom';

import moment from 'moment';

import { DropboxAuth, Dropbox as DropboxApi } from 'dropbox';

import {
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
} from '@mui/material';

import Icon from '@mdi/react';
import { mdiFolderOpenOutline } from '@mdi/js';

import Button from '../Button';
import Loader from '../Loader';
import Alert from '../Alert';

const FolderTree = ({ auth }) => {
    const [tree, setTree] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        const directories = async () => {
            var dropbox = new DropboxApi({
                auth: auth,
            });
            const items = await getDirectories(dropbox);
            setTree(dropboxFolders(items));
        };
        directories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getDirectories = async (dropbox, directories = [], cursor) => {
        if (cursor) {
            const response = await dropbox.filesListFolderContinue({
                cursor: cursor,
            });
            directories = directories.concat(
                response.result.entries.filter(
                    (item) => item['.tag'] === 'folder',
                ),
            );
            if (response.result.has_more) {
                directories = getDirectories(
                    dropbox,
                    directories,
                    response.result.cursor,
                );
            }
        } else {
            const response = await dropbox.filesListFolder({
                path: '',
                recursive: true,
            });
            directories = directories.concat(
                response.result.entries.filter(
                    (item) => item['.tag'] === 'folder',
                ),
            );
            if (response.result.has_more) {
                directories = getDirectories(
                    dropbox,
                    directories,
                    response.result.cursor,
                );
            }
        }
        return directories;
    };

    const dropboxFolders = (items) => {
        const root = [];
        const map = {};
        items.forEach((item) => {
            const parts = item.path_lower.split('/').filter(Boolean);
            let currentLevel = root;
            let currentPath = '';
            parts.forEach((part, index) => {
                currentPath += '/' + part;
                if (!map[currentPath]) {
                    const newNode = {
                        name: item.name,
                        id: item.id,
                        path: item.path_lower,
                        children: [],
                    };
                    map[currentPath] = newNode;
                    currentLevel.push(newNode);
                }
                // Letztes Element → Originaldaten anhängen
                if (index === parts.length - 1) {
                    map[currentPath] = {
                        ...map[currentPath],
                        ...item,
                        children: map[currentPath].children,
                    };
                }
                currentLevel = map[currentPath].children;
            });
        });
        return [{ name: 'Home', path: '', children: root, id: 'root' }];
    };

    const renderTree = (items, level = 0) => {
        return items.map((item) => (
            <Box key={item.id}>
                <ListItemButton
                    onClick={() =>
                        item.path !== undefined &&
                        dispatch(setFilesDropbox(item.path))
                    }
                    sx={{
                        padding: '8px 12px',
                        marginLeft: `${level * 30}px`,
                        color: (theme) => theme.palette.text.secondary,
                        '&:hover': {
                            color: (theme) =>
                                item.path !== undefined &&
                                theme.palette.secondary.main,
                        },
                        cursor: item.path === undefined && 'default',
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
                    ? renderTree(item.children, level + 1)
                    : null}
            </Box>
        ));
    };

    return tree ? (
        <>
            <Alert type={'tree'} style={{ marginBottom: '20px' }} />
            <List disablePadding>{renderTree(tree)}</List>
        </>
    ) : (
        <List disablePadding>{renderTree([{ name: 'lädt ...' }])}</List>
    );
};

const Dropbox = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const token = useSelector((state) => state.auth.token);
    const authProgress = useSelector((state) => state.auth.progress);
    const dataframeProgress = useSelector((state) => state.dataframe.progress);
    const error = useSelector((state) => state.message.error);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!!code) {
            dispatch(loginDropbox(code));
        } else {
            if (
                searchParams.get('error') === 'access_denied' &&
                searchParams.get('error_description') ===
                    'The user chose not to give your app access to their Dropbox account.'
            ) {
                dispatch(
                    alertErrorMessage(
                        'Zugriff verweigert. Stelle sicher, dass diese Anwendung auf deinen Dropbox-Account zugreifen darf.',
                        'dropbox-login',
                    ),
                );
            }
        }
        setSearchParams({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (dataframeProgress === false && !error) {
            navigate('/dashboard', {
                replace: true,
                state: { timestamp: moment().valueOf() },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataframeProgress, error]);

    const doAuth = () => {
        const dropbox = new DropboxAuth({
            clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
        });
        dropbox
            .getAuthenticationUrl(
                process.env.REACT_APP_DROPBOX_REDIRECT_URI,
                undefined,
                'code',
                'offline',
                undefined,
                undefined,
                true,
            )
            .then((authUrl) => {
                window.sessionStorage.clear();
                window.sessionStorage.setItem(
                    'codeVerifier',
                    dropbox.codeVerifier,
                );
                window.location.href = authUrl;
            })
            .catch((error) => console.error(error));
    };

    return dataframeProgress === null ? (
        !token ? (
            <>
                <Alert
                    type={['dropbox-login']}
                    style={{ marginBottom: '20px' }}
                />
                <Button
                    onClick={doAuth}
                    variant="contained"
                    fullWidth
                    disabled={authProgress}
                >
                    {!authProgress ? (
                        'mit Dropbox verknüpfen'
                    ) : (
                        <CircularProgress size={24.5} />
                    )}
                </Button>
            </>
        ) : (
            <FolderTree auth={token} />
        )
    ) : (
        <Loader />
    );
};

export default Dropbox;
