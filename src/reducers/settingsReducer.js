import {
    SETTING_DASHBOARD,
    SETTING_AUTOSAVE,
    SETTING_AUTOSAVE_MANUAL,
    SETTING_SIMPLE,
    SETTING_MODE,
    SETTING_COLOR,
} from '../actions/types';

import moment from 'moment';

const setCookie = (cname, cvalue, milliseconds) => {
    var expires = moment.utc().add(100, 'year').toDate();
    if (milliseconds > 0) {
        expires = moment.utc().add(milliseconds, 'ms').toDate();
    }
    document.cookie = `${cname}=${cvalue};expires=${expires};path=/`;
};

const getCookie = (cname) => {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
};

const removeCookie = (cname) => {
    document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const getCookieDefaultBoolean = (cookie, defaultValue) => {
    const value = getCookie(cookie);
    if (value) {
        return value === 'true';
    }
    return defaultValue;
};

const initialState = {
    theme: {
        color: {
            main: getCookie('theme.color.main') || '#076428', //'#006400',
            light: getCookie('theme.color.light') || '#70b87c', // '#7fb17f',
            start: getCookie('theme.color.start') || '#ff5722',
            end: getCookie('theme.color.end') || '#ffcc80',
        },
        mode: getCookie('theme.mode') || 'system',
    },
    autoSave: getCookieDefaultBoolean('autoSave', true),
    dashboard: {
        stats: getCookieDefaultBoolean('dashboard.stats', true),
        einnahmen: getCookieDefaultBoolean('dashboard.einnahmen', true),
        ausgaben: getCookieDefaultBoolean('dashboard.ausgaben', true),
        gesamt: getCookieDefaultBoolean('dashboard.gesamt', true),
        ausgabenTyp: getCookieDefaultBoolean('dashboard.ausgabenTyp', true),
        ausgabenKategorie: getCookieDefaultBoolean(
            'dashboard.ausgabenKategorie',
            true,
        ),
        nichtGelistet: getCookieDefaultBoolean('dashboard.nichtGelistet', true),
    },
    simple: getCookieDefaultBoolean('simple', false),
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SETTING_DASHBOARD:
            Object.keys(action.payload).forEach((k) => {
                if (action.payload[k]) {
                    removeCookie(`dashboard.${k}`);
                } else {
                    setCookie(`dashboard.${k}`, action.payload[k]);
                }
            });
            return {
                ...state,
                dashboard: { ...state.dashboard, ...action.payload },
            };
        case SETTING_AUTOSAVE:
            if (action.payload) {
                removeCookie('autoSave');
            } else {
                setCookie('autoSave', action.payload);
            }
            return {
                ...state,
                autoSave: action.payload,
            };
        case SETTING_AUTOSAVE_MANUAL:
            return {
                ...state,
                autoSave: action.payload,
            };
        case SETTING_SIMPLE:
            if (action.payload) {
                setCookie('simple', action.payload);
            } else {
                removeCookie('simple');
            }
            return {
                ...state,
                simple: action.payload,
            };
        case SETTING_MODE:
            if (action.payload === 'system') {
                removeCookie('theme.mode');
            } else {
                setCookie('theme.mode', action.payload);
            }
            return {
                ...state,
                theme: {
                    ...state.theme,
                    mode: action.payload,
                },
            };
        case SETTING_COLOR:
            Object.keys(action.payload).forEach((k) => {
                switch (k) {
                    case 'main':
                        if (action.payload[k] === '#006400') {
                            removeCookie(`theme.color.${k}`);
                        } else {
                            setCookie(`theme.color.${k}`, action.payload[k]);
                        }
                        break;
                    case 'light':
                        if (action.payload[k] === '#7fb17f') {
                            removeCookie(`theme.color.${k}`);
                        } else {
                            setCookie(`theme.color.${k}`, action.payload[k]);
                        }
                        break;
                    case 'start':
                        if (action.payload[k] === '#ff5722') {
                            removeCookie(`theme.color.${k}`);
                        } else {
                            setCookie(`theme.color.${k}`, action.payload[k]);
                        }
                        break;
                    case 'end':
                        if (action.payload[k] === '#ffcc80') {
                            removeCookie(`theme.color.${k}`);
                        } else {
                            setCookie(`theme.color.${k}`, action.payload[k]);
                        }
                        break;
                    default:
                        break;
                }
            });
            return {
                ...state,
                theme: {
                    ...state.theme,
                    color: {
                        ...state.theme.color,
                        ...action.payload,
                    },
                },
            };
        default:
            return state;
    }
};

export default reducer;
