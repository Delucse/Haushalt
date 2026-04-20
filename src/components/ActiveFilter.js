import { useDispatch, useSelector } from 'react-redux';
import {
    resetFilter,
    setFilter,
    setPrevFilterArts,
    setPrevFilterCategories,
    setPrevFilterTags,
    setPrevFilterTypes,
    setPrevFilterWord,
} from '../actions/filterActions';

import { Box, Chip } from '@mui/material';

import Icon from '@mdi/react';
import {
    mdiCrosshairs,
    mdiDelete,
    mdiFolderMultipleOutline,
    mdiMagnify,
    mdiPlusMinus,
    mdiTagOutline,
} from '@mdi/js';

const ActiveFilter = ({ except }) => {
    const dispatch = useDispatch();
    const { kategorien, art, typ, tags, word, count } = useSelector(
        (state) => state.filter,
    );

    return (
        count > 0 && (
            <Box
                sx={{
                    margin: 'auto 0',
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    overflowX: 'scroll',
                    scrollbarWidth: 'none',
                    gap: '5px',
                }}
            >
                {count > 1 && (
                    <Chip
                        size="small"
                        color="primary"
                        label="alle Filter löschen"
                        icon={
                            <Icon
                                path={mdiDelete}
                                size={0.6}
                                style={{ marginLeft: '8px' }}
                            />
                        }
                        onDelete={() => {
                            dispatch(resetFilter());
                        }}
                    />
                )}
                {(except === undefined || !except.includes('word')) &&
                    word.length > 0 && (
                        <Chip
                            size="small"
                            color="primary"
                            label={word}
                            icon={
                                <Icon
                                    path={mdiMagnify}
                                    size={0.6}
                                    style={{ marginLeft: '8px' }}
                                />
                            }
                            onDelete={() => {
                                dispatch(setPrevFilterWord(''));
                                dispatch(setFilter());
                            }}
                        />
                    )}
                {tags.length > 0 &&
                    tags.map((tag) => (
                        <Chip
                            size="small"
                            color="primary"
                            label={tag}
                            icon={
                                <Icon
                                    path={mdiTagOutline}
                                    size={0.6}
                                    style={{ marginLeft: '8px' }}
                                />
                            }
                            onDelete={() => {
                                dispatch(
                                    setPrevFilterTags(
                                        tags.filter((t) => t !== tag),
                                    ),
                                );
                                dispatch(setFilter());
                            }}
                        />
                    ))}
                {kategorien.length > 0 &&
                    kategorien.map((kategorie) => (
                        <Chip
                            size="small"
                            color="primary"
                            label={kategorie}
                            icon={
                                <Icon
                                    path={mdiFolderMultipleOutline}
                                    size={0.6}
                                    style={{ marginLeft: '8px' }}
                                />
                            }
                            onDelete={() => {
                                dispatch(
                                    setPrevFilterCategories(
                                        kategorien.filter(
                                            (k) => k !== kategorie,
                                        ),
                                    ),
                                );
                                dispatch(setFilter());
                            }}
                        />
                    ))}
                {typ.length > 0 &&
                    typ.map((t) => (
                        <Chip
                            size="small"
                            color="primary"
                            label={t}
                            icon={
                                <Icon
                                    path={mdiCrosshairs}
                                    size={0.6}
                                    style={{ marginLeft: '8px' }}
                                />
                            }
                            onDelete={() => {
                                dispatch(
                                    setPrevFilterTypes(
                                        typ.filter((ty) => ty !== t),
                                    ),
                                );
                                dispatch(setFilter());
                            }}
                        />
                    ))}
                {art.length > 0 &&
                    art.map((a) => (
                        <Chip
                            size="small"
                            color="primary"
                            label={a}
                            icon={
                                <Icon
                                    path={mdiPlusMinus}
                                    size={0.6}
                                    style={{ marginLeft: '8px' }}
                                />
                            }
                            onDelete={() => {
                                dispatch(
                                    setPrevFilterArts(
                                        art.filter((ar) => ar !== a),
                                    ),
                                );
                                dispatch(setFilter());
                            }}
                        />
                    ))}
            </Box>
        )
    );
};

export default ActiveFilter;
