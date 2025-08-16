import React from 'react';

import { IconButton as MuiIconButton, Tooltip } from '@mui/material';

function IconButton({ onClick, sx, tooltipProps, children, ...rest }) {
    const button = (
        <MuiIconButton onClick={onClick} sx={{ ...sx }} disableRipple {...rest}>
            {children}
        </MuiIconButton>
    );
    return tooltipProps ? (
        <Tooltip {...tooltipProps}>{button}</Tooltip>
    ) : (
        button
    );
}

export default IconButton;
