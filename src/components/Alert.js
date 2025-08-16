import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { resetMessage } from '../actions/messageActions';

import MuiAlert from '@mui/material/Alert';

import Icon from '@mdi/react';
import {
    mdiAlertCircleOutline,
    mdiCheckCircleOutline,
    mdiInformationVariantCircleOutline,
} from '@mdi/js';

function Alert(props) {
    const dispatch = useDispatch();

    const message = useSelector((state) => state.message.message);
    var type = useSelector((state) => state.message.type);
    if (type && typeof type === 'string' && type.includes('|')) {
        type = type.split('|')[0];
    }
    const art = useSelector((state) => state.message.art);
    const error = useSelector((state) => state.message.error);
    const onlyError = props.error ? !error : false;

    useEffect(() => {
        if (props.reset && art === 'alert' && props.type && props.type) {
            setTimeout(() => {
                dispatch(resetMessage());
            }, 5000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, type]);

    return (art === 'alert' &&
        props.type &&
        props.type.includes(type) &&
        !onlyError) ||
        props.message ? (
        <MuiAlert
            severity={
                props.severity
                    ? props.severity
                    : error || props.error
                    ? 'error'
                    : 'success'
            }
            sx={{
                marginBottom: '10px',
                borderRadius: 0,
            }}
            style={props.style}
            icon={
                <Icon
                    path={
                        error || props.error
                            ? mdiAlertCircleOutline
                            : props.severity === 'info'
                            ? mdiInformationVariantCircleOutline
                            : mdiCheckCircleOutline
                    }
                    size={1}
                />
            }
        >
            {props.message ? props.message : message}
        </MuiAlert>
    ) : null;
}

export default Alert;
