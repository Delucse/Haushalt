import {
    TableContainer,
    Table as MuiTable,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const Table = ({ height, head, body, orderBy, order, type }) => {
    const ref = useRef();
    const [orderTableBy, setOrderBy] = useState(orderBy || '');
    const [orderTable, setOrder] = useState(order || 'desc');
    const [bodyTable, setBody] = useState(body || []);

    const sort = (body) => {
        var index = head.findIndex((h) => h.value === orderTableBy);
        setBody([
            ...body.sort((a, b) => {
                if (orderTable === 'desc') {
                    if (a[index].sortValue) {
                        return a[index].sortValue - b[index].sortValue;
                    }
                    const nameA = a[index].value.toLowerCase(); // ignore upper and lowercase
                    const nameB = b[index].value.toLowerCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                } else {
                    if (a[index].sortValue) {
                        return b[index].sortValue - a[index].sortValue;
                    }
                    const nameA = a[index].value.toLowerCase(); // ignore upper and lowercase
                    const nameB = b[index].value.toLowerCase(); // ignore upper and lowercase
                    if (nameA > nameB) {
                        return -1;
                    }
                    if (nameA < nameB) {
                        return 1;
                    }
                    // names must be equal
                    return 0;
                }
            }),
        ]);
    };

    useEffect(() => {
        sort(bodyTable);
        // eslint-disable-next-line
    }, [orderTable, orderTableBy]);

    useEffect(() => {
        sort(body);
        // eslint-disable-next-line
    }, [body]);

    return (
        <TableContainer
            component={Paper}
            sx={{
                background: (theme) => theme.palette.background.default,
                boxShadow: 'none',
                maxHeight: height || '100%',
                scrollbarWidth: 'none',
            }}
            ref={ref}
        >
            <MuiTable stickyHeader>
                <TableHead>
                    <TableRow>
                        {head.map((cell, index) => (
                            <TableCell
                                key={`${type}-head-${index}`}
                                align={cell.align || 'left'}
                                sx={{
                                    paddingLeft: index === 0 ? 0 : 1,
                                    paddingRight:
                                        index === head.length - 1 ? 0 : 1,
                                    paddingTop: 1,
                                    paddingBottom: 1,
                                }}
                            >
                                {cell.sort ? (
                                    <TableSortLabel
                                        active={orderTableBy === cell.value}
                                        direction={
                                            orderTableBy === cell.value
                                                ? orderTable
                                                : 'asc'
                                        }
                                        onClick={(e) => {
                                            if (orderTableBy !== cell.value) {
                                                setOrderBy(cell.value);
                                            } else {
                                                setOrder(
                                                    orderTable === 'asc'
                                                        ? 'desc'
                                                        : 'asc',
                                                );
                                            }
                                            ref.current.scrollTop = 0;
                                        }}
                                    >
                                        {cell.value}
                                    </TableSortLabel>
                                ) : (
                                    cell.value
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bodyTable.map((row, index) => (
                        <TableRow
                            key={`${type}-body-${index}`}
                            sx={{
                                '&:last-child td, &:last-child th': {
                                    border: 0,
                                },
                            }}
                        >
                            {row.map((cell, i) => (
                                <TableCell
                                    key={`${type}-body-${index}-${i}`}
                                    component="th"
                                    scope="row"
                                    align={cell.align || 'left'}
                                    sx={{
                                        width: cell.width || 'inherit',
                                        paddingLeft: i === 0 ? 0 : 1,
                                        paddingRight:
                                            i === head.length - 1 ? 0 : 1,
                                        paddingTop: 1,
                                        paddingBottom: 1,
                                        color: cell.disabled
                                            ? (theme) =>
                                                  theme.palette.text.disabled
                                            : 'inherit',
                                        background: cell.highlighted
                                            ? (theme) =>
                                                  theme.palette.action.hover
                                            : 'inherit',
                                    }}
                                    onDoubleClick={cell.onDoubleClick}
                                >
                                    {cell.value}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </TableContainer>
    );
};

export default Table;
