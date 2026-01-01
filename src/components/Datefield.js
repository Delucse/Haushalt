import { Box, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useState } from 'react';

const Datefield = ({
    value,
    onChange,
    onOpen,
    style,
    interval,
    views,
    maxDate,
    minDate,
    format = 'DD.MM.YYYY',
    toolbarFormat,
}) => {
    const [open, setOpen] = useState(false);

    const onClick = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    return (
        <MobileDatePicker
            open={open}
            value={moment(value)}
            onChange={onChange}
            onOpen={onOpen}
            onClose={onClose}
            displayWeekNumber
            showDaysOutsideCurrentMonth
            closeOnSelect
            monthsPerRow={interval === 'Quartal' ? 4 : 3}
            enableAccessibleFieldDOMStructure={false}
            slots={{
                textField: () => (
                    <TextField
                        value={moment(value).format(format)}
                        onClick={onClick}
                        onKeyDown={(event) => {
                            if (event.keyCode === 13) {
                                onClick();
                            }
                        }}
                        placeholder="Datum"
                        sx={{
                            ...style,
                            width: '100%',
                            height: '56px',
                            '.MuiInputBase-root': {
                                borderRadius: 0,
                            },
                        }}
                    />
                ),
                calendarHeader: views
                    ? (ownerState) => (
                          <Box
                              sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginTop: '4px',
                                  marginBottom: '4px',
                                  paddingLeft: '24px',
                                  paddingRight: '24px',
                                  maxHeight: '40px',
                                  minHeight: '40px',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  lineHeight: 1.5,
                                  letterSpacing: '0.00938em',
                                  fontFamily:
                                      '"Roboto","Helvetica","Arial",sans-serif',
                              }}
                          >
                              {ownerState.view === 'month'
                                  ? interval === 'Quartal'
                                      ? 'Quartal'
                                      : 'Monat'
                                  : 'Jahr'}
                          </Box>
                      )
                    : null,
            }}
            slotProps={{
                mobilePaper: {
                    sx: {
                        borderRadius: '0px',
                    },
                },
                layout: {
                    sx: {
                        '.MuiDateCalendar-root': {
                            height: views ? '280px' : '300px',
                        },
                    },
                },
                monthButton: views &&
                    interval === 'Quartal' && {
                        sx: {
                            '&:not(:nth-child(3n - 2))': {
                                display: 'none',
                            },
                            '&:nth-child(1)::before': {
                                content: "'Q1'",
                            },
                            '&:nth-child(4)::before': {
                                content: "'Q2'",
                            },
                            '&:nth-child(7)::before': {
                                content: "'Q3'",
                            },
                            '&:nth-child(10)::before': {
                                content: "'Q4'",
                            },
                        },
                        children: '',
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
};

export default Datefield;
