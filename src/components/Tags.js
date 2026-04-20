import { useDispatch, useSelector } from 'react-redux';
import { setPrevFilterTags } from '../actions/filterActions';

import Autocomplete from './Autocomplete';

const Tags = () => {
    const dispatch = useDispatch();
    const filterTags = useSelector(
        (state) => state.filter.prev?.tags || state.filter.tags,
    );

    return (
        <Autocomplete
            value={filterTags}
            options={[]}
            placeholder={filterTags.length > 0 ? 'Tags' : 'Tags filtern'}
            fullWidth
            multiple
            freeSolo
            onChange={(value) => dispatch(setPrevFilterTags(value))}
        />
    );
};

export default Tags;
