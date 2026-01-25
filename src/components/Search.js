import { useDispatch, useSelector } from 'react-redux';
import { setFilter, setPrevFilterWord } from '../actions/filterActions';

import Icon from '@mdi/react';
import { mdiDelete, mdiMagnify } from '@mdi/js';

import Textfield from './Textfield';
import IconButton from './IconButton';
import Filter from './Filter';

const Search = ({ filter = false }) => {
    const dispatch = useDispatch();
    const word = useSelector((state) =>
        'word' in state.filter.prev
            ? state.filter.prev.word
            : state.filter.word,
    );

    return (
        <Textfield
            placeholder={filter ? 'Suche' : 'Suchwort'}
            variant="outlined"
            value={word}
            onChange={(e) => dispatch(setPrevFilterWord(e.target.value))}
            onKeyDown={(event) => {
                if (filter && event.key === 'Enter') {
                    dispatch(setFilter());
                }
            }}
            style={filter && { margin: '0 16px' }}
            labelStyle={{ marginLeft: '16px' }}
            start={<Icon path={mdiMagnify} size={1.1} />}
            end={
                <>
                    {word.length > 0 && (
                        <>
                            <IconButton
                                onClick={() => {
                                    dispatch(setPrevFilterWord(''));
                                    filter && dispatch(setFilter());
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                sx={{
                                    '&:hover': {
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                    },
                                }}
                            >
                                <Icon path={mdiDelete} size={1} />
                            </IconButton>
                            {filter && (
                                <span style={{ margin: '0 10px 0 2px' }}>
                                    |
                                </span>
                            )}
                        </>
                    )}
                    {filter && <Filter icon />}
                </>
            }
            fullWidth
        />
    );
};

export default Search;
