import {
    AUTH_SUCCESS,
    AUTH_ERROR,
    AUTH_TYPE,
    AUTH_PROGRESS,
    AUTH_LOGOUT,
    DATAFRAME_RESET,
    FILE_RESET,
    FILTER_RESET,
} from './types';

import { alertErrorMessage, snackbarMessage } from './messageActions';

import moment from 'moment';

import { FilenSDK } from '@filen/sdk';

import { Dropbox, DropboxAuth } from 'dropbox';

export const setAuthType = (type) => (dispatch) => {
    dispatch({
        type: AUTH_TYPE,
        payload: type,
    });
};

export const logout = () => (dispatch, getState) => {
    switch (getState().auth.type) {
        case 'filen':
            dispatch(logoutFilen());
            break;
        case 'dropbox':
            dispatch(logoutDropbox());
            break;
        default:
            dispatch({
                type: AUTH_LOGOUT,
            });
            break;
    }
    dispatch({ type: FILE_RESET });
    dispatch({ type: DATAFRAME_RESET });
    dispatch({ type: FILTER_RESET });
};

const logoutFilen = () => (dispatch, getState) => {
    const token = getState().auth.token;
    const filen = new FilenSDK({
        metadataCache: true, // Cache decrypted metadata in memory. Recommended.
        connectToSocket: false, // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
        ...token,
    });
    filen.logout();
    dispatch({
        type: AUTH_LOGOUT,
    });
    dispatch(
        snackbarMessage(
            'Du hast dich erfolgreich von "Filen" abgemeldet.',
            moment().valueOf(),
        ),
    );
};

const logoutDropbox = () => (dispatch, getState) => {
    const auth = getState().auth.token;
    const dropbox = new Dropbox({
        auth: auth,
    });
    dropbox.authTokenRevoke();
    dispatch({
        type: AUTH_LOGOUT,
    });
    dispatch(
        snackbarMessage(
            'Du hast erfolgreich die "Dropbox"-Verknüpfung widerrufen.',
            moment().valueOf(),
        ),
    );
};

export const loginFilen = (mail, password) => async (dispatch) => {
    dispatch({
        type: AUTH_PROGRESS,
        payload: true,
    });
    try {
        const filen = new FilenSDK({
            metadataCache: true, // Cache decrypted metadata in memory. Recommended.
            connectToSocket: false, // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
        });
        await filen.login({
            email: mail,
            password: password,
            // twoFactorCode: '123456', // Can be omitted if you do not have 2FA enabled.
        });

        dispatch({
            type: AUTH_SUCCESS,
            payload: filen.config,
        });
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: AUTH_ERROR,
        });
        dispatch(
            alertErrorMessage(
                'Benutzername oder Passwort ist fehlerhaft.',
                'user',
            ),
        );
    }
};

export const loginDropbox = (code) => async (dispatch) => {
    dispatch({
        type: AUTH_PROGRESS,
        payload: true,
    });
    try {
        const dbxAuth = new DropboxAuth({
            clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
        });

        dbxAuth.setCodeVerifier(window.sessionStorage.getItem('codeVerifier'));
        window.sessionStorage.clear();
        const response = await dbxAuth.getAccessTokenFromCode(
            process.env.REACT_APP_DROPBOX_REDIRECT_URI,
            code,
        );
        dbxAuth.setAccessToken(response.result.access_token);
        dispatch({
            type: AUTH_SUCCESS,
            payload: dbxAuth,
        });
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: AUTH_ERROR,
        });
        dispatch(
            alertErrorMessage(
                'Fehler: Es konnte keine gültige Verbindung zu deinem Dropbox-Account hergestellt werden. Versuche es noch einmal.',
                'dropbox-login',
            ),
        );
    }
};
