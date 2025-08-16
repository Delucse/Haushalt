import { useDispatch, useSelector } from 'react-redux';
import {
    setFilterCategories,
    setFilterCategoryType,
} from '../actions/filterActions';
import { Grid } from '@mui/material';
import Autocomplete from './Autocomplete';

const KategorienFilter = () => {
    const dispatch = useDispatch();
    const filterCategories = useSelector((state) => state.filter.kategorien);
    const filterCategoryType = useSelector(
        (state) => state.filter.kategorieTyp
    );
    const categories = useSelector(
        (state) => state.dataframe.original.kategorien
    )
        ?.unique(filterCategoryType)
        .toDict()
        [filterCategoryType].sort();

    return (
        <>
            <Grid item xxs={12} sm={3}>
                <Autocomplete
                    value={filterCategoryType}
                    options={['Oberkategorie', 'Unterkategorie']}
                    placeholder={'Kategorie'}
                    fullWidth
                    onChange={(value) => dispatch(setFilterCategoryType(value))}
                    select
                />
            </Grid>
            {categories && (
                <Grid item xxs={12} sm={3}>
                    <Autocomplete
                        value={filterCategories}
                        options={categories}
                        placeholder={
                            filterCategories.length > 0
                                ? filterCategoryType
                                : `alle ${filterCategoryType}n`
                        }
                        fullWidth
                        multiple
                        onChange={(value) =>
                            dispatch(setFilterCategories(value))
                        }
                    />
                </Grid>
            )}
        </>
    );
};

export default KategorienFilter;
