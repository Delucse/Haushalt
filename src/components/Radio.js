import { FormControlLabel, RadioGroup, Radio as MuiRadio } from '@mui/material';

const Radio = ({ value, onChange, row, options }) => {
    return (
        <RadioGroup
            value={value}
            onChange={onChange}
            row={row}
            sx={{
                color: (theme) => theme.palette.text.primary,
            }}
        >
            {options.map((o, i) => (
                <FormControlLabel
                    key={i}
                    value={o.value}
                    control={
                        <MuiRadio sx={i > 0 && row && { marginLeft: '20px' }} />
                    }
                    sx={{ marginRight: 0 }}
                    label={o.label}
                />
            ))}
        </RadioGroup>
    );
};

export default Radio;
