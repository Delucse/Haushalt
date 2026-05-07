import { useSelector } from 'react-redux';

import { useTheme } from '@mui/material';

import TimeSeriesBarChart from './TimeSeriesBarChart';

import generateColor from '../utils/color';

function EinnahmenBarChart({ print }) {
    const filterCategoryType = useSelector(
        (state) => state.filter.kategorieTyp,
    );
    const interval = useSelector((state) => state.filter.time.interval);
    const groups = ['Jahr', filterCategoryType];
    interval !== 'Jahr' && groups.push(interval);
    const umsatzEinnahme = useSelector(
        (state) => state.dataframe.filtered.umsatz,
    )?.filter({ Art: 'Einnahme' });

    const aggregated = umsatzEinnahme
        .groupBy(...groups)
        .aggregate((group) => group.stat.sum('Betrag'))
        .rename('aggregation', 'Betrag');
    const aggregatedCollection = aggregated?.toCollection();
    const categories =
        aggregated
            ?.unique(filterCategoryType)
            .sortBy(filterCategoryType, true)
            .toDict()[filterCategoryType] || [];

    const theme = useTheme();
    const colors = generateColor(
        theme.palette.secondary.main,
        theme.palette.secondary.light,
        categories.length,
    );

    return (
        <TimeSeriesBarChart
            datasets={categories.map((c, i) => {
                return {
                    label: c,
                    data: aggregatedCollection
                        .filter((u) => u[filterCategoryType] === c)
                        .map((d) => {
                            return {
                                x: `${d.Jahr}-${d[interval]}`,
                                y: d.Betrag,
                            };
                        }),
                    backgroundColor: colors[i],
                    borderColor: theme.palette.background.default,
                };
            })}
            print={print}
        />
    );
}

export default EinnahmenBarChart;
