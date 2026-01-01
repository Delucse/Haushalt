import { Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    setFilterTimeInterval,
    setFilterTimeRange,
} from '../actions/filterActions';
import Datefield from './Datefield';
import moment from 'moment';
import Autocomplete from './Autocomplete';

const Zeitrange = () => {
    const dispatch = useDispatch();
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);
    const { range, interval } = useSelector((state) => state.filter.time);

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
                            dispatch(setFilterTimeInterval(opt.value))
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
                                umsatzDf.stat.min('Zeitstempel')
                        ).startOf('year')}
                        maxDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.max('Zeitstempel')
                        ).endOf('year')}
                        onChange={(newValue) =>
                            dispatch(
                                setFilterTimeRange([
                                    newValue.startOf('month').valueOf(),
                                    range[1],
                                ])
                            )
                        }
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
                        minDate={moment(range[0])}
                        maxDate={moment(
                            umsatzDf.count() > 0 &&
                                umsatzDf.stat.max('Zeitstempel')
                        ).endOf('year')}
                        onChange={(newValue) =>
                            dispatch(
                                setFilterTimeRange([
                                    range[0],
                                    newValue.endOf('month').valueOf(),
                                ])
                            )
                        }
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
