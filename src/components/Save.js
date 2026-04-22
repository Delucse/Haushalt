import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { uploadFiles, downloadFiles } from '../actions/fileActions';

import { Fab } from '@mui/material';

import Icon from '@mdi/react';
import { mdiContentSave } from '@mdi/js';

const Save = () => {
    const dispatch = useDispatch();
    const changedFile = useSelector((state) => state.file.changed);
    const isCloud = useSelector((state) => state.auth.type !== 'lokal');

    return (
        changedFile && (
            <Fab
                color="primary"
                onClick={() =>
                    dispatch(isCloud ? uploadFiles() : downloadFiles())
                }
                sx={{
                    position: 'fixed',
                    bottom: { xxs: '72px', sm: '16px' },
                    right: '16px',
                }}
            >
                <Icon
                    path={mdiContentSave}
                    size={1}
                    style={{ color: 'inherit' }}
                />
            </Fab>
        )
    );
};

export default Save;
