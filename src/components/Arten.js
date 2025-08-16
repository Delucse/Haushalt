import { useDispatch, useSelector } from 'react-redux';
import { setFilterArts } from '../actions/filterActions';
import Autocomplete from './Autocomplete';

const Arten = () => {
    const dispatch = useDispatch();
    const filterArts = useSelector((state) => state.filter.art);
    const umsatz = useSelector((state) => state.dataframe.original.umsatz);
    const arts =
        umsatz?.count() > 0 ? umsatz.unique('Art').toDict().Art.sort() : [];

    return (
        arts && (
            <Autocomplete
                value={filterArts}
                options={arts}
                placeholder={filterArts.length > 0 ? 'Art' : 'alle Arten'}
                fullWidth
                multiple
                onChange={(value) => dispatch(setFilterArts(value))}
            />
        )
    );
};

export default Arten;
