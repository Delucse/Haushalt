import moment from 'moment/moment';

import { calcNichtGelistet, initUmsatz } from './umsatzActions';
import { initKategorien } from './kategorienActions';
import { initWiederkehrenderUmsatz } from './wiederkehrenderUmsatz';
import { initAbschluss } from './abschlussActions';
import { initUmbuchung } from './umbuchungActions';
import { setPrevFilterTimeRange, setFilter } from '../filterActions';
import { snackbarErrorMessage } from '../messageActions';

import { getCookieDefaultBoolean } from '../../reducers/settingsReducer';

import {
    DATAFRAME_INIT,
    DATAFRAME_INIT_PROGRESS,
    SETTING_AUTOSAVE_MANUAL,
} from '../types';

export const initDataframe = () => async (dispatch, getState) => {
    try {
        const state = getState();
        const type = state.auth.type;
        const file = state.file;

        if (type === 'lokal') {
            dispatch({ type: SETTING_AUTOSAVE_MANUAL, payload: false });
        } else {
            const autosave = getCookieDefaultBoolean('autoSave', true);
            dispatch({ type: SETTING_AUTOSAVE_MANUAL, payload: autosave });
        }

        // Kategorien
        var kategorien = await initKategorien(file.kategorien);
        // wiederkehrender Umsatz
        var wiederkehrenderUmsatz = await initWiederkehrenderUmsatz(
            file.wiederkehrenderUmsatz,
            kategorien,
        );
        // Umsatz
        var umsatz = await initUmsatz(
            file.umsatz,
            kategorien,
            wiederkehrenderUmsatz,
        );
        // Umbuchung
        var umbuchung = await initUmbuchung(file.umbuchung);
        // Abschluss
        var abschluss = await initAbschluss(file.abschluss, umsatz);
        umsatz = calcNichtGelistet(umsatz, abschluss, umbuchung);

        dispatch({
            type: DATAFRAME_INIT,
            payload: {
                original: {
                    umsatz: umsatz,
                    wiederkehrenderUmsatz: wiederkehrenderUmsatz,
                    kategorien: kategorien,
                    umbuchung: umbuchung,
                    abschluss: abschluss,
                },
                filtered: {
                    umsatz: umsatz.slice(),
                    umbuchung: umbuchung.slice(),
                    abschluss: abschluss.slice(),
                },
            },
        });

        const maxUmsatzDate =
            umsatz.count() > 0
                ? moment(umsatz.stat.max('Zeitstempel'))
                : moment();
        dispatch(
            setPrevFilterTimeRange([
                maxUmsatzDate.clone().startOf('month').valueOf(),
                maxUmsatzDate.clone().endOf('month').valueOf(),
            ]),
        );
        dispatch(setFilter());
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: false,
        });
    } catch (error) {
        console.log(error.message);
        dispatch({
            type: DATAFRAME_INIT_PROGRESS,
            payload: false,
        });
        dispatch(
            snackbarErrorMessage(
                'Es ist ein Fehler bei der Analyse der Dateien aufgetreten.',
            ),
        );
    }
};
