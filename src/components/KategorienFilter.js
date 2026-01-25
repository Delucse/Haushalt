import { useDispatch, useSelector } from 'react-redux';
import {
    setPrevFilterCategories,
    setPrevFilterCategoryType,
} from '../actions/filterActions';

import { Grid } from '@mui/material';

import Autocomplete from './Autocomplete';

const KategorienFilter = () => {
    const dispatch = useDispatch();
    const filterCategories = useSelector(
        (state) => state.filter.prev?.kategorien || state.filter.kategorien,
    );
    const filterCategoryType = useSelector(
        (state) => state.filter.prev?.kategorieTyp || state.filter.kategorieTyp,
    );
    const categories = useSelector(
        (state) => state.dataframe.original.kategorien,
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
                    onChange={(value) =>
                        dispatch(setPrevFilterCategoryType(value))
                    }
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
                            dispatch(setPrevFilterCategories(value))
                        }
                    />
                </Grid>
            )}
        </>
    );
};

export default KategorienFilter;
