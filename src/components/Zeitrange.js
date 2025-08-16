import { Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    setFilterTimeInterval,
    setFilterTimeRange,
} from '../actions/filterActions';
import Datefield from './Datefield';
import moment from 'moment';
import Autocomplete from './Autocomplete';
import { useState } from 'react';

const Zeitrange = () => {
    const dispatch = useDispatch();
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);
    const { range, interval } = useSelector((state) => state.filter.time);
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    return (
        umsatzDf && (
            <Grid container spacing={1.5}>
                <Grid item xxs={12} sm={4}>
                    <Autocomplete
                        value={interval}
                        placeholder={'Interval'}
                        options={['Monat', /*'Quartal',*/ 'Jahr']}
                        fullWidth
                        onChange={(value) =>
                            dispatch(setFilterTimeInterval(value))
                        }
                    />
                </Grid>
                <Grid item xxs={12} sm={4}>
                    <Datefield
                        open={startOpen}
                        onClose={() => {
                            setStartOpen(false);
                            setEndOpen(true);
                        }}
                        onClick={() => {
                            setStartOpen(true);
                        }}
                        value={range[0]}
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
                        toolbarFormat={`[von] ${
                            interval === 'Monat' ? 'MMM YYYY' : 'YYYY'
                        }`}
                        format={`[von] ${
                            interval === 'Monat' ? 'MMMM YYYY' : 'YYYY'
                        }`}
                    />
                </Grid>
                <Grid item xxs={12} sm={4}>
                    <Datefield
                        open={endOpen}
                        onClose={() => {
                            setEndOpen(false);
                            // setStartOpen(false);
                        }}
                        onClick={() => {
                            setStartOpen(true);
                            // setEndOpen(true);
                        }}
                        value={range[1]}
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
                            interval === 'Monat' ? 'MMM YYYY' : 'YYYY'
                        }`}
                        format={`[bis] ${
                            interval === 'Monat' ? 'MMMM YYYY' : 'YYYY'
                        }`}
                    />
                </Grid>
            </Grid>
        )
    );
};

export default Zeitrange;
