import { useSelector } from 'react-redux';

import { useTheme } from '@mui/material';

import TimeSeriesBarChart from './TimeSeriesBarChart';

import generateColor from '../utils/color';

function UmsatzBarChart() {
    const interval = useSelector((state) => state.filter.time.interval);
    const groups = ['Jahr'];
    interval !== 'Jahr' && groups.push(interval);
    const umsatz = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    )?.filter(
        (row) =>
            row.get('Kategorie') !== 'nicht gelistet' ||
            (row.get('Kategorie') === 'nicht gelistet' &&
                row.get('Betrag') !== 0),
    );
    const aggregated = umsatz
        ?.groupBy(...groups)
        .aggregate((group) => group.stat.sum('Umsatz'))
        .rename('aggregation', 'Umsatz');
    const aggregatedCollection = aggregated
        ?.sortBy(['Jahr', interval])
        .toCollection();

    const data = aggregatedCollection.map((d) => {
        return {
            x: `${d.Jahr}-${d[interval]}`,
            y: d.Umsatz,
        };
    });

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        2,
    );

    const datasets = [];
    const scales = {};
    if (data.length > 0) {
        datasets.push({
            label: 'Umsatz',
            data: data,
            backgroundColor: colors[0],
            borderColor: theme.palette.background.default,
            yAxisID: 'y',
            order: 2,
            type: 'bar',
        });
        scales.y = { position: 'left', stacked: false, min: undefined };

        if (data.length > 1) {
            datasets.push({
                label: 'kum. Umsatz',
                data: data.reduce(
                    (array, data, index) => [
                        ...array,
                        { x: data.x, y: data.y + (array[index - 1]?.y || 0) },
                    ],
                    [],
                ),
                backgroundColor: colors[1],
                borderColor: colors[1],
                yAxisID: 'sum',
                order: 1,
                type: 'line',
                pointRadius: 1,
                tension: 0,
            });
            scales.sum = {
                type: 'linear',
                position: 'right',
                grid: {
                    display: false,
                },
                ticks: {
                    callback: (tickValue) =>
                        tickValue
                            .toLocaleString('de-DE', {
                                minimumFractionDigits: 0,
                                style: 'currency',
                                currency: 'EUR',
                            })
                            .replace('-', '- '),
                    color: theme.palette.text.primary,
                },
            };
        }
    }

    return (
        <TimeSeriesBarChart
            datasets={datasets}
            scales={scales}
            tooltip={{
                mode: 'index',
                position: 'nearest',
                callbacks: { footer: () => [] },
            }}
        />
    );
}

export default UmsatzBarChart;
