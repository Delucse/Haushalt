import QRCode from 'react-qr-code';

import { Box } from '@mui/material';

import DelucseLogo from './DelucseLogo';

const Qr = ({ color }) => {
    return (
        <Box>
            <QRCode
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={window.location}
                viewBox={`0 0 256 256`}
                fgColor={color}
                level="M"
            />
            <DelucseLogo
                color={color}
                style={{ height: '34px', marginTop: '6px' }}
            />
        </Box>
    );
};

export default Qr;
