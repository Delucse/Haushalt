import { Badge, Box, Divider, Grid, Typography } from '@mui/material';
import Arten from './Arten';
import KategorienFilter from './KategorienFilter';
import Typen from './Typen';
import Zeitrange from './Zeitrange';
import { mdiFilterVariant } from '@mdi/js';
import { useState } from 'react';
import Icon from '@mdi/react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Dialog from './Dialog';

const Zeitangabe = ({ margin }) => {
    const { range, interval } = useSelector((state) => state.filter.time);
    const dateRange = [moment(range[0]), moment(range[1])];
    const createZeitangabe = (range, interval) => {
        const yearRange = [
            dateRange[0].format('YYYY'),
            dateRange[1].format('YYYY'),
        ];
        switch (interval) {
            case 'Jahr':
                return yearRange[0] === yearRange[1]
                    ? yearRange[0]
                    : `von ${yearRange[0]} bis ${yearRange[1]}`;
            default:
                // month
                const monthRange = [
                    dateRange[0].format('MMMM'),
                    dateRange[1].format('MMMM'),
                ];
                return `${monthRange[0]} ${yearRange[0]}` ===
                    `${monthRange[1]} ${yearRange[1]}`
                    ? `${monthRange[0]} ${yearRange[0]}`
                    : yearRange[0] === yearRange[1]
                    ? `von ${monthRange[0]} bis ${monthRange[1]} ${yearRange[1]}`
                    : `von ${monthRange[0]} ${yearRange[0]} bis ${monthRange[1]} ${yearRange[1]}`;
        }
    };

    return (
        <Typography
            sx={{
                margin: `auto 12px auto ${margin ? margin : 5}px`,
                color: (theme) => theme.palette.text.primary,
            }}
        >
            {createZeitangabe(dateRange, interval)}
        </Typography>
    );
};

const Filter = ({ icon }) => {
    const [open, setOpen] = useState(false);
    const filterCount = useSelector(
        (state) =>
            state.filter.kategorien.length +
            state.filter.typ.length +
            state.filter.art.length
    );

    return (
        <>
            <Box
                sx={{
                    position: 'sticky',
                    top: { xxs: 0, sm: '56px' },
                    marginTop: '-16px',
                    paddingTop: '16px',
                    background: (theme) => theme.palette.background.default,
                    zIndex: icon ? 'inherit' : 1,
                }}
            >
                <Box
                    onClick={() => setOpen(true)}
                    sx={{
                        display: 'flex',
                        width: 'fit-content',
                        cursor: 'pointer',
                    }}
                >
                    <Badge
                        badgeContent={filterCount}
                        color="primary"
                        overlap="circular"
                        sx={{
                            color: icon
                                ? 'inherit'
                                : (theme) => theme.palette.primary.main,
                            '&:hover': {
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        slotProps={{
                            badge: {
                                sx: {
                                    background: (theme) =>
                                        icon
                                            ? theme.palette.action.active
                                            : theme.palette.primary.light,
                                    bottom: '10px',
                                    '&:hover': {
                                        background: (theme) =>
                                            theme.palette.primary.light,
                                    },
                                },
                            },
                        }}
                    >
                        <Icon path={mdiFilterVariant} size={icon ? 1.2 : 1.4} />
                    </Badge>
                    {!open && !icon && (
                        <Zeitangabe margin={filterCount > 0 && 15} />
                    )}
                </Box>
            </Box>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                closeIcon={true}
                sxTitle={{
                    border: (theme) =>
                        `4px solid ${theme.palette.primary.main}`,
                    borderBottom: 'none',
                }}
                title={
                    <Box sx={{ display: 'flex' }}>
                        <Box
                            sx={{
                                color: (theme) => theme.palette.primary.main,
                                marginRight: '5px',
                            }}
                        >
                            <Icon path={mdiFilterVariant} size={1.4} />
                        </Box>
                        Filter
                    </Box>
                }
                fullWidth
                maxWidth="xl"
                sxContent={{
                    border: (theme) =>
                        `4px solid ${theme.palette.primary.main}`,
                    borderTop: 'none',
                }}
                content={
                    <>
                        <Zeitrange />
                        <Divider
                            orientation="horizontal"
                            sx={{
                                borderColor: (theme) =>
                                    theme.palette.primary.main,
                                margin: '12px 0',
                            }}
                        />
                        <Grid container spacing={1.5}>
                            <Grid item xxs={12} sm={3}>
                                <Arten />
                            </Grid>
                            <Grid item xxs={12} sm={3}>
                                <Typen />{' '}
                            </Grid>
                            <KategorienFilter />
                        </Grid>
                    </>
                }
            />
        </>
        // <Accordion
        //     expanded={open}
        //     onChange={() => setOpen(!open)}
        //     disableGutters
        //     sx={{
        //         boxShadow: 'none',
        //         background: (theme) => theme.palette.background.default,
        //     }}
        // >
        //     <AccordionSummary
        //         sx={{
        //             padding: 0,
        //             '& .MuiAccordionSummary-content': {
        //                 margin: 0,
        //             },
        //             minHeight: 'fit-content',
        //         }}
        //     >
        //         <Box sx={{ color: (theme) => theme.palette.primary.main }}>
        //             <Icon path={mdiFilterVariant} size={1.4} />
        //         </Box>
        //         {!open && <Zeitangabe />}
        //     </AccordionSummary>
        //     <AccordionDetails
        //         sx={{
        //             border: (theme) =>
        //                 `1px solid ${theme.palette.primary.main}`,
        //             padding: '12px',
        //             marginTop: '12px',
        //         }}
        //     >
        //         <Zeitrange />
        //         <Divider
        //             orientation="horizontal"
        //             sx={{
        //                 borderColor: (theme) => theme.palette.primary.main,
        //                 margin: '12px 0',
        //             }}
        //         />
        //         <Grid container spacing={1.5}>
        //             <Grid item xxs={12} sm={3}>
        //                 <Arten />
        //             </Grid>
        //             <Grid item xxs={12} sm={3}>
        //                 <Typen />{' '}
        //             </Grid>
        //             <KategorienFilter />
        //         </Grid>
        //     </AccordionDetails>
        // </Accordion>
    );
};

export default Filter;
