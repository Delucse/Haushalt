import { MobileDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

const Datefield = ({
    value,
    onChange,
    onOpen,
    onClose,
    onClick,
    style,
    views,
    maxDate,
    minDate,
    format,
    toolbarFormat,
    open,
}) =>
    open !== undefined ? (
        <MobileDatePicker
            open={open}
            value={moment(value)}
            onChange={onChange}
            onOpen={onOpen}
            onClose={onClose}
            displayWeekNumber
            showDaysOutsideCurrentMonth
            closeOnSelect
            slotProps={{
                mobilePaper: {
                    sx: {
                        borderRadius: '0px',
                    },
                },
                textField: {
                    sx: {
                        ...style,
                        width: '100%',
                        height: '56px',
                        '.MuiInputBase-root': {
                            borderRadius: 0,
                        },
                    },
                    placeholder: 'Datum',
                    onClick: onClick,
                },
                actionBar: {
                    sx: {
                        display: 'none',
                    },
                },
                switchViewButton: {
                    sx: {
                        display: 'none',
                    },
                },
                toolbar: {
                    sx: {
                        'span.MuiTypography-root': {
                            display: 'none',
                        },
                    },
                    toolbarFormat: toolbarFormat,
                },
            }}
            views={views}
            orientation={'portrait'}
            maxDate={maxDate}
            minDate={minDate}
            format={format}
        />
    ) : (
        <MobileDatePicker
            value={moment(value)}
            onChange={onChange}
            displayWeekNumber
            showDaysOutsideCurrentMonth
            closeOnSelect
            slotProps={{
                mobilePaper: {
                    sx: {
                        borderRadius: '0px',
                    },
                },
                textField: {
                    sx: {
                        ...style,
                        width: '100%',
                        height: '56px',
                        '.MuiInputBase-root': {
                            borderRadius: 0,
                        },
                    },
                    placeholder: 'Datum',
                },
                actionBar: {
                    sx: {
                        display: 'none',
                    },
                },
                switchViewButton: {
                    sx: {
                        display: 'none',
                    },
                },
                toolbar: {
                    sx: {
                        'span.MuiTypography-root': {
                            display: 'none',
                        },
                    },
                    toolbarFormat: toolbarFormat,
                },
            }}
            views={views}
            orientation={'portrait'}
            maxDate={maxDate}
            minDate={minDate}
            format={format}
        />
    );

export default Datefield;
