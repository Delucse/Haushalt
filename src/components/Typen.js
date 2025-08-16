import { useDispatch, useSelector } from 'react-redux';
import { setFilterTypes } from '../actions/filterActions';
import Autocomplete from './Autocomplete';

const Typen = () => {
    const dispatch = useDispatch();
    const filterTypes = useSelector((state) => state.filter.typ);
    // const types = useSelector((state) => state.dataframe.original.umsatz)
    //     ?.unique('Typ')
    //     .toDict()
    //     .Typ.sort();
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
                onChange={(value) => dispatch(setFilterTypes(value))}
            />
        )
    );
};

export default Typen;
