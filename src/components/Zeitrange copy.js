import { Slider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterTimeRange } from '../actions/filterActions';

const months = [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
];

const quartals = [
    'I',
    'I',
    'I',
    'II',
    'II',
    'II',
    'III',
    'III',
    'III',
    'IV',
    'IV',
    'IV',
];

const createRange = (startDate, endDate, interval) => {
    startDate = new Date(startDate.getFullYear(), 0, 1);
    endDate = new Date(endDate.getFullYear(), 12, 0);
    console.log(startDate, endDate);
    const range = [];
    switch (interval) {
        case 'Quartal':
            while (startDate < endDate) {
                var year = startDate.getFullYear();
                var month = startDate.getMonth();
                var quartal = quartals[month];
                var label = `Q ${quartal}`;
                if (quartal === 'I' || startDate.valueOf() === range[0]) {
                    label += ` '${year.toString().substring(2, 4)}`;
                }
                range.push({
                    value: year + month / 12,
                    label: (
                        <div style={{ textAlign: 'center' }}>
                            Q {quartal}
                            {quartal === 'I' || range.length === 0 ? (
                                <>
                                    <br />
                                    {year}
                                </>
                            ) : null}
                        </div>
                    ),
                });
                startDate = new Date(year, month + 3, 1);
            }
            break;
        case 'Jahr':
            while (startDate < endDate) {
                // eslint-disable-next-line
                var year = startDate.getFullYear();
                // eslint-disable-next-line
                var label = year;
                range.push({ value: year, label: year });
                startDate = new Date(year + 1, 1, 1);
            }
            break;
        default:
            while (startDate < endDate) {
                // eslint-disable-next-line
                var year = startDate.getFullYear();
                // eslint-disable-next-line
                var month = startDate.getMonth();
                range.push({
                    value: year + month / 12,
                    label: (
                        <div style={{ textAlign: 'center' }}>
                            {months[month]}
                            {month < 1 || range.length === 0 ? (
                                <>
                                    <br />
                                    {year}
                                </>
                            ) : null}
                        </div>
                    ),
                });
                startDate = new Date(year, month + 1, 1);
            }
            break;
    }
    return range;
};

const Zeitrange = () => {
    const dispatch = useDispatch();
    const umsatzDf = useSelector((state) => state.dataframe.original.umsatz);
    const { range, interval } = useSelector((state) => state.filter.time);

    const [date, setDate] = useState([]);
    const [timeRange, setRange] = useState([]);

    useEffect(() => {
        var startDate = new Date(range[0]);
        var endDate = new Date(range[1]);
        switch (interval) {
            case 'Quartal':
                setDate([
                    startDate.getFullYear() + startDate.getMonth() / 12,
                    endDate.getFullYear() + (endDate.getMonth() - 2) / 12,
                ]);
                break;
            case 'Jahr':
                setDate([startDate.getFullYear(), endDate.getFullYear()]);
                break;
            default:
                setDate([
                    startDate.getFullYear() + startDate.getMonth() / 12,
                    endDate.getFullYear() + endDate.getMonth() / 12,
                ]);
                break;
        }
    }, [range, interval]);

    useEffect(() => {
        if (umsatzDf)
            setRange(
                createRange(
                    new Date(umsatzDf.stat.min('Zeitstempel')),
                    new Date(umsatzDf.stat.max('Zeitstempel')),
                    interval
                )
            );
        // eslint-disable-next-line
    }, [interval]);

    return (
        timeRange.length > 0 && (
            <Slider
                value={date}
                onChange={(e, value) => setDate(value)}
                onChangeCommitted={(e, [startDate, endDate]) => {
                    var startYear = Math.floor(startDate);
                    var startMonth = Math.round((startDate - startYear) * 12);
                    var endYear = Math.floor(endDate);
                    var endMonth = Math.round((endDate - endYear) * 12);
                    var range = [];
                    switch (interval) {
                        case 'Quartal':
                            range = [
                                new Date(startYear, startMonth, 1).valueOf(),
                                new Date(endYear, endMonth + 3, 0).valueOf(),
                            ];
                            break;
                        case 'Jahr':
                            range = [
                                new Date(startYear, startMonth, 1).valueOf(),
                                new Date(endYear, endMonth + 12, 0).valueOf(),
                            ];
                            break;
                        default:
                            range = [
                                new Date(startYear, startMonth, 1).valueOf(),
                                new Date(endYear, endMonth + 1, 0).valueOf(),
                            ];
                            break;
                    }
                    dispatch(setFilterTimeRange(range));
                }}
                valueLabelDisplay="off"
                min={timeRange[0].value}
                step={
                    interval === 'Jahr'
                        ? 1
                        : interval === 'Quartal'
                        ? 1 / 4
                        : 1 / 12
                }
                max={timeRange[timeRange.length - 1].value}
                componentsProps={{
                    root: {
                        sx: {
                            padding: 0,
                            width: timeRange.length * 35,
                            mt: '15px',
                            mb: '58px',
                        },
                    },
                    thumb: {
                        sx: {
                            borderRadius: 0,
                            width: '2px',
                            height: '30px',
                            border: 'none',
                            background: (theme) => theme.palette.secondary.main,
                            '&:before': { boxShadow: 'none' },
                            '&:last-child': {
                                ml: '35px',
                            },
                        },
                    },
                    mark: {
                        sx: {
                            width: '35px',
                            height: '20px',
                            background: (theme) =>
                                theme.palette.secondary.light,
                            border: 'none',
                        },
                    },
                    markLabel: {
                        sx: {
                            width: '35px',
                            ml: '17.5px',
                        },
                    },
                    track: {
                        sx: {
                            height: '20px',
                            zIndex: 1,
                            border: 'none',
                            borderRadius: 0,
                            paddingRight: '35px',
                            background: (theme) => theme.palette.secondary.main,
                        },
                    },
                    rail: {
                        sx: { height: 0 },
                    },
                }}
                track="normal"
                marks={timeRange}
            />
        )
    );
};

export default Zeitrange;
