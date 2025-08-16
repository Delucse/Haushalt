import { combineReducers } from 'redux';
import authReducer from './authReducer';
import messageReducer from './messageReducer';
import fileReducer from './fileReducer';
import dataframeReducer from './dataframeReducer';
import filterReducer from './filterReducer';
import settingsReducer from './settingsReducer';

export default combineReducers({
    message: messageReducer,
    auth: authReducer,
    file: fileReducer,
    dataframe: dataframeReducer,
    filter: filterReducer,
    settings: settingsReducer,
});
