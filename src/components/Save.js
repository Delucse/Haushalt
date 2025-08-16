import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import Icon from '@mdi/react';
import { mdiContentSave } from '@mdi/js';
import { Fab } from '@mui/material';
import { uploadFiles } from '../actions/fileActions';

const Save = () => {
    const dispatch = useDispatch();
    const changedFile = useSelector((state) => state.file.changed);

    return (
        changedFile && (
            <Fab
                color="primary"
                onClick={() => dispatch(uploadFiles())}
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
