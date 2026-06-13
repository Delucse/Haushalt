import {
    SETTING_AUTOSAVE,
    SETTING_COLOR,
    SETTING_DASHBOARD,
    SETTING_MODE,
    SETTING_SIMPLE,
} from './types';

import { snackbarMessage } from './messageActions';

export const setAutoSave =
    (auto, message = true) =>
    (dispatch) => {
        dispatch({ type: SETTING_AUTOSAVE, payload: auto === 'true' });
        message &&
            dispatch(
                snackbarMessage(
                    `Das Speicherverhalten wurde erfolgreich in den Einstellungen übernommen.`,
                    `settings.autoSave=${auto}`,
                ),
            );
    };

export const setDashboard =
    (element, setting, message = true) =>
    (dispatch) => {
        const payload = {};
        payload[element] = setting;
        dispatch({
            type: SETTING_DASHBOARD,
            payload: payload,
        });
        message &&
            dispatch(
                snackbarMessage(
                    `Die Dashboard-Anzeige wurde erfolgreich in den Einstellungen übernommen.`,
                    `settings.dashboard.${element}=${setting}`,
                ),
            );
    };

export const setSimple =
    (simple, message = true) =>
    (dispatch) => {
        dispatch({ type: SETTING_SIMPLE, payload: simple === 'true' });
        message &&
            dispatch(
                snackbarMessage(
                    `Der Umfang der Anwendung wurde erfolgreich in den Einstellungen übernommen.`,
                    `settings.simple=${simple}`,
                ),
            );
    };

export const setMode =
    (mode, message = true) =>
    (dispatch) => {
        dispatch({
            type: SETTING_MODE,
            payload: mode,
        });
        message &&
            dispatch(
                snackbarMessage(
                    `Der neue Modus wurde erfolgreich in den Einstellungen übernommen.`,
                    `settings.theme.mode=${mode}`,
                ),
            );
    };

export const setColor =
    (color, message = true) =>
    (dispatch) => {
        dispatch({
            type: SETTING_COLOR,
            payload: color,
        });
        message &&
            dispatch(
                snackbarMessage(
                    `Das neue Farbschema wurde erfolgreich in den Einstellungen übernommen.`,
                    `settings.theme.color=${JSON.stringify(color)}`,
                ),
            );
    };

export const reset = () => (dispatch, getState) => {
    if (getState().auth.type !== 'lokal') {
        dispatch(setAutoSave('true', false));
    }
    dispatch(setSimple('false', false));
    dispatch(setMode('system', false));
    dispatch(
        setColor(
            {
                main: '#006400',
                light: '#7fb17f',
                start: '#ff5722',
                end: '#ffcc80',
            },
            false,
        ),
    );
    dispatch({
        type: SETTING_DASHBOARD,
        payload: {
            stats: true,
            einnahmen: true,
            ausgaben: true,
            gesamt: true,
            ausgabenTyp: true,
            ausgabenKategorie: true,
            nichtGelistet: true,
        },
    });
    dispatch(
        snackbarMessage(
            `Die Einstellungen wurden erfolgreich zurückgesetzt.`,
            `resetSettings`,
        ),
    );
};
