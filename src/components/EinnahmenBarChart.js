import React from 'react';

import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

import { useSelector } from 'react-redux';
import generateColor from '../utils/color';
import { useTheme } from '@mui/material';

function EinnahmenBarChart() {
    const filterCategoryType = useSelector(
        (state) => state.filter.kategorieTyp
    );
    const interval = useSelector((state) => state.filter.time.interval);
    const groups = ['Jahr', filterCategoryType];
    interval !== 'Jahr' && groups.push(interval);
    const umsatzEinnahme = useSelector(
        (state) => state.dataframe.filtered.umsatz
    )?.filter({ Art: 'Einnahme' });
    const umsatzEinnahmeCollection = umsatzEinnahme?.toCollection();

    const aggregated = umsatzEinnahme
        .groupBy(...groups)
        .aggregate((group) => group.stat.sum('Betrag'))
        .rename('aggregation', 'Betrag');
    const aggregatedCollection = aggregated?.toCollection();
    const categories =
        aggregated?.unique(filterCategoryType).toDict()[filterCategoryType] ||
        [];
    const labels = useSelector((state) => state.filter.time.labels) || [];

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        categories.length
    );

    return umsatzEinnahmeCollection ? (
        umsatzEinnahmeCollection.length > 0 ? (
            <Bar
                data={{
                    labels: labels.map((l) => l.Label),
                    datasets: categories.map((c, i) => {
                        var data = Array.from(
                            { length: labels.length },
                            (v, i) => 0
                        );
                        aggregatedCollection
                            .filter((u) => u[filterCategoryType] === c)
                            .forEach(
                                (u) =>
                                    (data[
                                        labels.findIndex(
                                            (elem) =>
                                                elem.Jahr === u.Jahr &&
                                                elem[interval] === u[interval]
                                        )
                                    ] = u.Betrag)
                            );
                        return {
                            label: c,
                            data: data,
                            backgroundColor: colors[i],
                            borderColor: theme.palette.background.default,
                        };
                    }),
                }}
                options={{
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false,
                                // color: (ctx) => {
                                //     if (ctx.tick && ctx.tick.value === 0)
                                //         return theme.palette.text.disabled;
                                // },
                                drawTicks: true,
                            },
                            ticks: {
                                color: theme.palette.text.primary,
                            },
                        },
                        y: {
                            stacked: true,
                            min: 0,
                            ticks: {
                                callback: function (value, index, values) {
                                    return value + ' €';
                                },
                                color: theme.palette.text.primary,
                            },
                            grid: {
                                drawTicks: true,
                                // color: theme.palette.text.disabled,
                            },
                        },
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
                            callbacks: {
                                label: (context) => [
                                    `${
                                        context.dataset.label
                                    }: ${context.raw.toLocaleString('de-DE', {
                                        minimumFractionDigits: 2,
                                    })} €`,
                                ],
                            },
                        },
                        title: {
                            display: false,
                            text: 'Einnahmen',
                            color: theme.palette.text.disabled,
                        },
                    },
                }}
            />
        ) : (
            'keine Daten'
        )
    ) : null;
}

export default EinnahmenBarChart;
