import React, { useState } from 'react';

import MuiAutocomplete, {
    createFilterOptions,
} from '@mui/material/Autocomplete';
import {
    TextField,
    InputAdornment,
    Popper,
    CircularProgress,
    Checkbox,
} from '@mui/material';

import Icon from '@mdi/react';
import { mdiChevronDown, mdiClose } from '@mdi/js';

const filter = createFilterOptions();

function Autocomplete({ value = '', ...props }) {
    const [inputValue, setInputValue] = useState('');

    return (
        <MuiAutocomplete
            value={value}
            onChange={(event, newValue) => {
                if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    props.onChange(newValue.inputValue);
                } else {
                    props.onChange(newValue);
                }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                if (props.onInputChange) {
                    props.onInputChange(newInputValue);
                }
            }}
            options={props.options}
            getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                    return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                    return option.inputValue;
                }
                // Regular option
                return option[props.optionLabel];
            }}
            groupBy={(option) =>
                props.optionGroup ? option[props.optionGroup] : null
            }
            renderOption={
                props.multiple
                    ? (props, option, { selected }) => {
                          const { key, ...optionProps } = props;
                          return (
                              <li key={props.key} {...optionProps}>
                                  <Checkbox checked={selected} />
                                  {option}
                              </li>
                          );
                      }
                    : (prop, option) => (
                          <li {...prop}>
                              {props.optionLabel
                                  ? option[props.optionLabel]
                                  : option}
                          </li>
                      )
            }
            filterOptions={
                props.freeSolo
                    ? (options, params) => {
                          const filtered = filter(options, params);
                          const { inputValue } = params;
                          // Suggest the creation of a new value
                          if (props.optionLabel) {
                          }
                          const isExisting = options.some(
                              (option) => inputValue === option,
                          );
                          if (inputValue !== '' && !isExisting) {
                              //   var object = { inputValue };
                              //   object[
                              //       props.optionLabel
                              //   ] = `"${inputValue}" hinzufügen`;
                              filtered.push(inputValue);
                          }
                          return filtered;
                      }
                    : filter
            }
            renderInput={
                props.multiple
                    ? (params) => (
                          <TextField
                              {...params}
                              placeholder={props.placeholder}
                          />
                      )
                    : (params) => (
                          <TextField
                              {...params}
                              label={props.label}
                              placeholder={props.placeholder}
                              InputProps={{
                                  ...params.InputProps,
                                  type: 'search',
                                  error: props.error,
                                  startAdornment: props.start ? (
                                      <InputAdornment
                                          sx={{ maxHeight: '56px' }}
                                          position="start"
                                      >
                                          {props.start}
                                      </InputAdornment>
                                  ) : null,
                                  endAdornment: (
                                      <>
                                          {props.loading ? (
                                              <CircularProgress
                                                  color="primary"
                                                  size={20}
                                              />
                                          ) : null}
                                          {params.InputProps.endAdornment}
                                      </>
                                  ),
                              }}
                          />
                      )
            }
            freeSolo={props.freeSolo}
            fullWidth={props.fullWidth}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            openOnFocus
            loading={props.loading}
            sx={{
                '.MuiAutocomplete-inputRoot': {
                    borderRadius: '0px',
                    height: '56px',
                    background: props.error
                        ? 'rgba(253, 237, 237, 0.7)'
                        : 'inherit',
                },
                '.MuiOutlinedInput-notchedOutline': {
                    borderWidth: props.error ? '2px' : '1px',
                },
                '.MuiAutocomplete-popupIndicator': {
                    '&:hover': {
                        color: (theme) => theme.palette.primary.main,
                        background: 'none',
                    },
                },
                '.MuiTouchRipple-root': {
                    display: 'none',
                },
                ...props.style,
            }}
            componentsProps={{
                paper: {
                    sx: {
                        borderRadius: 0,
                    },
                },
                clearIndicator: {
                    sx: {
                        '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                            background: 'none',
                        },
                    },
                },
            }}
            PopperComponent={({ style, ...props }) => (
                <Popper
                    {...props}
                    sx={{
                        ...style,
                        zIndex: 99999,
                    }}
                />
            )}
            clearIcon={<Icon path={mdiClose} size={1} />}
            popupIcon={<Icon path={mdiChevronDown} size={1.1667} />}
            clearText="löschen"
            closeText="schließen"
            openText="öffnen"
            noOptionsText="keine Ergebnisse"
            loadingText="lädt ..."
            multiple={props.multiple}
            disableCloseOnSelect={props.multiple}
            limitTags={props.multiple ? 1 : -1}
            slotProps={{
                chip: {
                    color: 'primary',
                },
            }}
            // renderTags={(values, getItemProps) =>
            //     values.map((option, index) => {
            //         const { key, ...itemProps } = getItemProps({ index });
            //         return (
            //             <Chip
            //                 key={key}
            //                 label={option}
            //                 {...itemProps}
            //                 color="primary"
            //             />
            //         );
            //     })
            // }
            disableClearable={props.select}
            disabled={props.disabled}
        />
    );
}

export default Autocomplete;
