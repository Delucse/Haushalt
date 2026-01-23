import 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';

import { useSelector } from 'react-redux';
import generateColor from '../utils/color';
import { useTheme } from '@mui/material';

function AusgabenPieChart() {
    const umsatzAusgabe = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    )?.filter({ Art: 'Ausgabe' });
    const umsatzAusgabeCollection = umsatzAusgabe
        ?.filter(
            (row) =>
                row.get('Kategorie') !== 'nicht gelistet' ||
                (row.get('Kategorie') === 'nicht gelistet' &&
                    row.get('Betrag') !== 0),
        )
        .toCollection();

    const aggregated = umsatzAusgabe
        .groupBy('Typ')
        .aggregate((group) => group.stat.sum('Betrag'))
        .rename('aggregation', 'Betrag');
    const sum = Math.round(aggregated.stat.sum('Betrag') * 100) / 100;
    const aggregatedCollection = aggregated?.toCollection();

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        aggregatedCollection.length,
    );

    return umsatzAusgabeCollection ? (
        umsatzAusgabeCollection.length > 0 ? (
            <Doughnut
                data={{
                    labels: aggregatedCollection.map((c) => c.Typ),
                    datasets: [
                        {
                            data: aggregatedCollection.map((c) => c.Betrag),
                            backgroundColor: colors,
                            borderColor: theme.palette.background.default,
                        },
                    ],
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
                            cornerRadius: 0,
                            callbacks: {
                                label: (context) => [
                                    ` ${(
                                        (context.raw / sum) *
                                        100
                                    ).toLocaleString('de-DE', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })} % bzw.`,
                                    ` ${context.raw.toLocaleString('de-DE', {
                                        minimumFractionDigits: 2,
                                    })} €`,
                                ],
                            },
                        },
                        title: {
                            display: false,
                            text: 'Ausgaben nach Typ',
                            color: theme.palette.text.primary,
                        },
                    },
                }}
            />
        ) : (
            'keine Daten'
        )
    ) : null;
}

export default AusgabenPieChart;
