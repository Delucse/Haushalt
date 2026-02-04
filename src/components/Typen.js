import { useDispatch, useSelector } from 'react-redux';
import { setPrevFilterTypes } from '../actions/filterActions';

import Autocomplete from './Autocomplete';

const Typen = () => {
    const dispatch = useDispatch();
    const filterTypes = useSelector(
        (state) => state.filter.prev?.typ || state.filter.typ,
    );

    return (
        <Autocomplete
            value={filterTypes}
            options={['fix', 'variabel']}
            placeholder={filterTypes.length > 0 ? 'Typ' : 'alle Typen'}
            fullWidth
            multiple
            onChange={(value) => dispatch(setPrevFilterTypes(value))}
        />
    );
};

export default Typen;
