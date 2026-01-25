import { useDispatch, useSelector } from 'react-redux';
import {
    setPrevFilterTimeInterval,
    setPrevFilterTimeRange,
} from '../actions/filterActions';

import { Grid } from '@mui/material';

import moment from 'moment';

import Datefield from './Datefield';
import Autocomplete from './Autocomplete';

const Zeitrange = () => {
    const dispatch = useDispatch();
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);
    const { range, interval } = useSelector(
        (state) => state.filter.prev?.time || state.filter.time,
    );

    const momentInterval =
        interval === 'Monat'
            ? 'month'
            : interval === 'Quartal'
              ? 'quarter'
              : 'year';

    return (
        umsatzDf && (
            <Grid container spacing={1.5}>
                <Grid item xxs={12} sm={4}>
                    <Autocomplete
                        value={interval}
                        placeholder={'Interval'}
                        options={[
                            { label: 'Monat', value: 'Monat' },
                            { label: 'Quartal', value: 'Quartal' },
                            { label: 'Jahr', value: 'Jahr' },
                        ]}
                        optionLabel="label"
                        select={true}
                        fullWidth
                        onChange={(opt) =>
                            dispatch(setPrevFilterTimeInterval(opt.value))
                        }
                    />
                </Grid>
                <Grid item xxs={12} sm={4}>
                    <Datefield
                        value={range[0]}
                        interval={interval}
                        views={
                            interval === 'Jahr' ? ['year'] : ['month', 'year']
                        }
                        minDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.min('Zeitstempel'),
                        ).startOf('year')}
                        maxDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.max('Zeitstempel'),
                        ).endOf('year')}
                        onChange={(newValue) => {
                            if (newValue.valueOf() > range[1]) {
                                dispatch(
                                    setPrevFilterTimeRange([
                                        newValue
                                            .startOf(momentInterval)
                                            .valueOf(),
                                        newValue
                                            .endOf(momentInterval)
                                            .valueOf(),
                                    ]),
                                );
                            } else {
                                dispatch(
                                    setPrevFilterTimeRange([
                                        newValue
                                            .startOf(momentInterval)
                                            .valueOf(),
                                        range[1],
                                    ]),
                                );
                            }
                        }}
                        toolbarFormat={`[von ] ${
                            interval === 'Monat'
                                ? 'MMM YYYY'
                                : interval === 'Quartal'
                                  ? '[Q]Q YYYY'
                                  : 'YYYY'
                        }`}
                        format={`[von] ${
                            interval === 'Monat'
                                ? 'MMMM YYYY'
                                : interval === 'Quartal'
                                  ? '[Q]Q YYYY'
                                  : 'YYYY'
                        }`}
                    />
                </Grid>
                <Grid item xxs={12} sm={4}>
                    <Datefield
                        value={range[1]}
                        interval={interval}
                        views={
                            interval === 'Jahr' ? ['year'] : ['month', 'year']
                        }
                        minDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.min('Zeitstempel'),
                        ).startOf('year')}
                        maxDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.max('Zeitstempel'),
                        ).endOf('year')}
                        onChange={(newValue) => {
                            if (newValue.valueOf() < range[0]) {
                                dispatch(
                                    setPrevFilterTimeRange([
                                        newValue
                                            .startOf(momentInterval)
                                            .valueOf(),
                                        newValue
                                            .endOf(momentInterval)
                                            .valueOf(),
                                    ]),
                                );
                            } else {
                                dispatch(
                                    setPrevFilterTimeRange([
                                        range[0],
                                        newValue
                                            .endOf(momentInterval)
                                            .valueOf(),
                                    ]),
                                );
                            }
                        }}
                        toolbarFormat={`[bis] ${
                            interval === 'Monat'
                                ? 'MMM YYYY'
                                : interval === 'Quartal'
                                  ? '[Q]Q YYYY'
                                  : 'YYYY'
                        }`}
                        format={`[bis] ${
                            interval === 'Monat'
                                ? 'MMMM YYYY'
                                : interval === 'Quartal'
                                  ? '[Q]Q YYYY'
                                  : 'YYYY'
                        }`}
                    />
                </Grid>
            </Grid>
        )
    );
};

export default Zeitrange;
