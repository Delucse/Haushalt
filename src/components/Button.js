import React from 'react';

import { Button as MuiButton } from '@mui/material';

function Button({ onClick, sx, children, ...rest }) {
    const button = (
        <MuiButton
            onClick={onClick}
            sx={{ borderRadius: 0, boxShadow: 'none', ...sx }}
            disableRipple
            {...rest}
        >
            {children}
        </MuiButton>
    );
    return button;
}

export default Button;
