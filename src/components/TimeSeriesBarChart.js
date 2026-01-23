import { useSelector } from 'react-redux';

import { Bar } from 'react-chartjs-2';

import { useTheme } from '@mui/material';

import moment from 'moment';

function TimeSeriesBarChart({ datasets, scales, tooltip }) {
    const timeRange = useSelector((state) => state.filter.time.range);
    const interval = useSelector((state) => state.filter.time.interval);

    const theme = useTheme();

    return datasets ? (
        datasets.length > 0 ? (
            <Bar
                data={{
                    datasets: datasets,
                }}
                options={{
                    scales: {
                        x: {
                            suggestedMin: moment(timeRange[0]),
                            suggestedMax: moment(timeRange[1]).startOf(
                                interval === 'Quartal'
                                    ? 'quarter'
                                    : interval === 'Monat'
                                      ? 'month'
                                      : 'year',
                            ),
                            type: 'time',
                            distribution: 'series',
                            time: {
                                parser:
                                    interval === 'Quartal'
                                        ? 'YYYY-Q'
                                        : interval === 'Monat'
                                          ? 'YYYY-MM'
                                          : 'YYYY-YYYY',
                                tooltipFormat: () => {
                                    switch (interval) {
                                        case 'Quartal':
                                            return '[Q]Q YYYY';
                                        case 'Jahr':
                                            return 'YYYY';
                                        default:
                                            return 'MMMM YYYY';
                                    }
                                },
                                unit: () => {
                                    switch (interval) {
                                        case 'Quartal':
                                            return 'quarter';
                                        case 'Jahr':
                                            return 'year';
                                        default:
                                            return 'month';
                                    }
                                },
                            },
                            stacked: true,
                            grid: {
                                display: false,
                                drawTicks: true,
                            },
                            ticks: {
                                color: theme.palette.text.primary,
                                callback: (tickValue, index, ticks) => {
                                    const date = moment(tickValue);
                                    switch (interval) {
                                        case 'Quartal':
                                            if (
                                                index === 0 ||
                                                date.format('Q.YY') !==
                                                    moment(
                                                        ticks[index - 1].value,
                                                    ).format('Q.YY')
                                            ) {
                                                if (
                                                    index === 0 ||
                                                    date.quarter() === 1
                                                ) {
                                                    return [
                                                        `Q${date.quarter()}`,
                                                        date.format("'YY"),
                                                    ];
                                                }
                                                return date.format('[Q]Q');
                                            }
                                            return;
                                        case 'Jahr':
                                            if (
                                                index === 0 ||
                                                date.year() !==
                                                    moment(
                                                        ticks[index - 1].value,
                                                    ).year()
                                            ) {
                                                return date.format('YYYY');
                                            }
                                            return;
                                        default:
                                            if (
                                                index === 0 ||
                                                date.format('MM.YY') !==
                                                    moment(
                                                        ticks[index - 1].value,
                                                    ).format('MM.YY')
                                            ) {
                                                if (
                                                    index === 0 ||
                                                    date.month() === 0
                                                ) {
                                                    return date.format(
                                                        "MMM 'YY",
                                                    );
                                                }
                                                return date.format('MMM');
                                            }
                                            return;
                                    }
                                },
                            },
                        },
                        y: {
                            stacked: true,
                            min: 0,
                            ticks: {
                                callback: (tickValue) =>
                                    tickValue.toLocaleString('de-DE', {
                                        minimumFractionDigits: 0,
                                    }) + ' €',
                                color: theme.palette.text.primary,
                            },
                            grid: {
                                drawTicks: true,
                                // color: theme.palette.text.disabled,
                            },
                        },
                        ...scales,
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'x',
                            cornerRadius: 0,
                            itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
                            callbacks: {
                                label: (context) => [
                                    ` ${
                                        context.dataset.label
                                    }: ${context.raw.y.toLocaleString('de-DE', {
                                        minimumFractionDigits: 2,
                                    })} €`,
                                ],
                                footer: (context) => [
                                    '     _________________',
                                    `     Summe: ${context
                                        .reduce(
                                            (accumulator, currentValue) =>
                                                accumulator +
                                                currentValue.raw.y,
                                            0,
                                        )
                                        .toLocaleString('de-DE', {
                                            minimumFractionDigits: 2,
                                        })} €`,
                                ],
                            },
                            footerFont: { weight: 'normal' },
                            footerMarginTop: -5,
                            ...tooltip,
                        },
                        title: {
                            display: false,
                        },
                    },
                }}
            />
        ) : (
            'keine Daten'
        )
    ) : null;
}

export default TimeSeriesBarChart;
