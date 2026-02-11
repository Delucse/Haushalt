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
import { useEffect, useState } from 'react';

const Table = ({ head, body, orderBy, order, type }) => {
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
            }}
        >
            <MuiTable>
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
                                    }}
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
