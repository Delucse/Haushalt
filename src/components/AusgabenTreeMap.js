import Chart from 'chart.js/auto';
import { Chart as ReactChart } from 'react-chartjs-2';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

import { useSelector } from 'react-redux';
import generateColor from '../utils/color';
import { useTheme } from '@mui/material';
import { useState } from 'react';

Chart.register(TreemapController, TreemapElement);

function AusgabenTreeMap() {
    const filterCategoryType = useSelector(
        (state) => state.filter.kategorieTyp
    );
    const umsatzAusgabe = useSelector(
        (state) => state.dataframe.filtered.umsatz
    )?.filter({ Art: 'Ausgabe' });
    const umsatzAusgabeCollection = umsatzAusgabe?.toCollection();

    const aggregated = umsatzAusgabe
        .groupBy(filterCategoryType)
        .aggregate((group) => group.stat.sum('Betrag'))
        .rename('aggregation', 'Betrag');
    const sum = Math.round(aggregated.stat.sum('Betrag') * 100) / 100;
    const aggregatedCollection = aggregated?.toCollection();

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        aggregatedCollection.length
    );

    const [duration, setDuration] = useState(1000);

    return umsatzAusgabeCollection ? (
        umsatzAusgabeCollection.length > 0 &&
        (umsatzAusgabeCollection[0].Kategorie !== 'nicht gelistet' ||
            (umsatzAusgabeCollection[0].Betrag !== 0 &&
                umsatzAusgabeCollection[0].Kategorie === 'nicht gelistet')) ? (
            <ReactChart
                type="treemap"
                data={{
                    datasets: [
                        {
                            // label: aggregatedCollection.map(
                            //     (c) => c[filterCategoryType]
                            // ),
                            tree: aggregatedCollection.map((c, i) => {
                                return {
                                    label: c[filterCategoryType],
                                    data: c.Betrag,
                                    background: colors[i],
                                };
                            }),
                            backgroundColor(ctx) {
                                if (ctx.type !== 'data') {
                                    return 'transparent';
                                }
                                return ctx.raw._data.background;
                            },
                            key: 'data',
                            labels: {
                                display: true,
                                position: 'bottom',
                                align: 'left',
                                formatter: (ctx) => {
                                    // return `${
                                    //     ctx.raw._data.label
                                    // }: ${ctx.raw._data.data.toLocaleString(
                                    //     'de-DE'
                                    // )} €`;
                                    return ctx.raw._data.label;
                                },
                            },
                            borderWidth: 0,
                            spacing: 1,
                            captions: {
                                display: false,
                            },
                            borderColor: theme.palette.background.default,
                        },
                    ],
                }}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: {
                        duration: duration,
                        onComplete: (context) => {
                            if (context.initial) setDuration(0);
                        },
                    },
                    plugins: {
                        title: {
                            display: false,
                            text: 'Ausgaben je Kategorie',
                            color: theme.palette.text.primary,
                        },
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                            usePointStyle: true,
                            callbacks: {
                                label: function (ctx) {
                                    return [
                                        ` ${(
                                            (ctx.raw._data.data / sum) *
                                            100
                                        ).toLocaleString('de-DE', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })} %`,
                                        ` ${ctx.raw._data.data.toLocaleString(
                                            'de-DE',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )} €`,
                                        // 'Test',
                                    ];
                                },
                                title: function (ctx) {
                                    // console.log(ctx);
                                    return ctx[0].raw._data.label;
                                },
                                labelPointStyle: function (context) {
                                    return {
                                        pointStyle: 'triangle',
                                        rotation: 0,
                                        radius: 0.1,
                                    };
                                },
                            },
                        },
                    },
                }}
            />
        ) : (
            'keine Daten'
        )
    ) : null;
}

export default AusgabenTreeMap;
