import { useDispatch, useSelector } from 'react-redux';
import { setPrevFilterTypes } from '../actions/filterActions';

import Autocomplete from './Autocomplete';

const Typen = () => {
    const dispatch = useDispatch();
    const filterTypes = useSelector(
        (state) => state.filter.prev?.typ || state.filter.typ,
    );
    const types = useSelector((state) => state.dataframe.original.kategorien)
        ?.unique('Typ')
        .toDict()
        .Typ.sort();

    return (
        types && (
            <Autocomplete
                value={filterTypes}
                options={types}
                placeholder={filterTypes.length > 0 ? 'Typ' : 'alle Typen'}
                fullWidth
                multiple
                onChange={(value) => dispatch(setPrevFilterTypes(value))}
            />
        )
    );
};

export default Typen;
