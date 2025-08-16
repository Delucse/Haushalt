import { FormControlLabel, Switch as MuiSwitch } from '@mui/material';

const Switch = ({ label, checked, onChange }) => {
    return (
        <FormControlLabel
            control={<MuiSwitch checked={checked} onChange={onChange} />}
            label={label}
            componentsProps={{
                typography: {
                    sx: {
                        color: (theme) => theme.palette.text.primary,
                    },
                },
            }}
        />
    );
};

export default Switch;
