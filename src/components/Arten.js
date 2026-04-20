import { useDispatch, useSelector } from 'react-redux';
import { setPrevFilterArts } from '../actions/filterActions';

import Autocomplete from './Autocomplete';

const Arten = () => {
    const dispatch = useDispatch();
    const filterArts = useSelector(
        (state) => state.filter.prev?.art || state.filter.art,
    );

    return (
        <Autocomplete
            value={filterArts}
            options={['Einnahme', 'Ausgabe']}
            placeholder={filterArts.length > 0 ? 'Art' : 'alle Arten'}
            fullWidth
            multiple
            onChange={(value) => dispatch(setPrevFilterArts(value))}
        />
    );
};

export default Arten;
