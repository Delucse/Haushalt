import React from 'react';

import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

import { useSelector } from 'react-redux';
import generateColor from '../utils/color';
import { useTheme } from '@mui/material';

function UmsatzBarChart() {
    const interval = useSelector((state) => state.filter.time.interval);
    const groups = ['Jahr'];
    interval !== 'Jahr' && groups.push(interval);
    const umsatz = useSelector((state) => state.dataframe.filtered.umsatz);
    const umsatzCollection = umsatz
        ?.filter(
            (row) =>
                row.get('Kategorie') !== 'nicht gelistet' ||
                (row.get('Kategorie') === 'nicht gelistet' &&
                    row.get('Betrag') !== 0)
        )
        .toCollection();

    const aggregated = umsatz
        ?.groupBy(...groups)
        .aggregate((group) => group.stat.sum('Umsatz'))
        .rename('aggregation', 'Umsatz');
    const aggregatedCollection = aggregated?.toCollection();
    const labels = useSelector((state) => state.filter.time.labels) || [];

    const data = Array.from({ length: labels.length }, (v, i) => 0);
    aggregatedCollection.forEach(
        (u) =>
            (data[
                labels.findIndex(
                    (elem) =>
                        elem.Jahr === u.Jahr && elem[interval] === u[interval]
                )
            ] = u.Umsatz)
    );

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        2
    );
    const datasets = [
        {
            label: 'Umsatz',
            data: data,
            backgroundColor: colors[0],
            borderColor: theme.palette.background.default,
            yAxisID: 'y',
            order: 2,
            type: 'bar',
        },
    ];
    if (labels.length > 1) {
        datasets.push({
            label: 'kum. Umsatz',
            data: data.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []),
            backgroundColor: colors[1],
            borderColor: colors[1],
            yAxisID: 'sum',
            order: 1,
            type: 'line',
            pointRadius: 1,
            tension: 0.4,
        });
    }

    return umsatzCollection ? (
        umsatzCollection.length > 0 ? (
            <Bar
                data={{
                    labels: labels.map((l) => l.Label),
                    datasets: datasets,
                }}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
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
                            text: 'Gesamt',
                            color: theme.palette.text.primary,
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                // color: (ctx) => {
                                //     console.log(ctx);
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
                            type: 'linear',
                            position: 'left',
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
                        sum:
                            labels.length > 1
                                ? {
                                      type: 'linear',
                                      position: 'right',
                                      grid: {
                                          display: false,
                                      },
                                      ticks: {
                                          callback: function (
                                              value,
                                              index,
                                              values
                                          ) {
                                              return value + ' €';
                                          },
                                          color: theme.palette.text.primary,
                                      },
                                  }
                                : false,
                    },
                }}
            />
        ) : (
            'keine Daten'
        )
    ) : null;
}

export default UmsatzBarChart;
