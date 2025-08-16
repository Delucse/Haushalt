import { Backdrop, Box } from '@mui/material';

const Coin = ({ id, delay, duration, toX, toY, fromX, fromY }) => {
    return (
        <Box
            sx={{
                [`@keyframes coin-x-axis-${id}`]: {
                    '30%': {
                        opacity: 1,
                    },
                    '70%': {
                        opacity: 1,
                    },
                    '100%': {
                        left: `calc(${toX} * 1.5)`,
                    },
                },
                [`@keyframes coin-y-axis-and-flip-${id}`]: {
                    '30%': {
                        opacity: 1,
                    },
                    '70%': {
                        opacity: 1,
                    },
                    '100%': {
                        transform: `translateY(calc(${toY} * 1.5)) rotate3d(1, 1, 1, 1080deg)`,
                    },
                },
                // coin
                position: 'absolute',
                top: fromX || '24px',
                left: fromY || '24px',
                zIndex: 100,
                opacity: '0',
                // coin--animated
                animationDelay: delay,
                animationDuration: duration || '1.5s',
                animationDirection: 'normal',
                animationFillMmode: 'both',
                animationPlayState: 'running',
                animationIterationCount: 'infinite',
                animationName: `coin-x-axis-${id}`,
                animationTimingFunction: 'ease-in',
                ':after': {
                    // coin
                    content: '"€"',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '12px',
                    height: '12px',
                    fontSize: '10px',
                    color: 'rgb(237, 196, 107)',
                    background: 'rgb(227, 162, 23)',
                    border: '2px solid rgb(237, 196, 107)',
                    borderRadius: '50%',
                    opacity: 0,
                    // coin--animated
                    animationDelay: delay,
                    animationDuration: duration || '1.5s',
                    animationDirection: 'normal',
                    animationFillMmode: 'both',
                    animationPlayState: 'running',
                    animationIterationCount: 'infinite',
                    animationName: `coin-y-axis-and-flip-${id}`,
                    animationTimingFunction: 'ease-out',
                },
            }}
        ></Box>
    );
};

const Loader = () => {
    return (
        <Backdrop
            open
            sx={{
                zIndex: 99999,
                background: (theme) => theme.palette.background.default,
                // background: (theme) => theme.palette.primary.main,
            }}
        >
            <Box
                sx={{
                    width: '64px',
                    height: '64px',
                    position: 'relative',
                    // marginLeft: '-32px',
                    // width: 'calc(256px * 3.5)',
                    // marginTop: 'calc(64px - 256px)',
                    // marginLeft: 'calc(64px - 400px)',
                    // display: 'flex',
                }}
                id="wallet"
            >
                {/* <Box
                    sx={{
                        width: '400%',
                        height: '400%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // borderRadius: '50%',
                        // background: '#0066ff',
                        color: (theme) => theme.palette.primary.light,
                        // color: (theme) => theme.palette.primary.main,
                        position: 'relative',
                        zIndex: '101',
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z" />
                    </svg>
                </Box>
                <Box
                    sx={{
                        // width: '400%',
                        height: '400%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // borderRadius: '50%',
                        // background: '#0066ff',
                        color: (theme) => theme.palette.primary.light,
                        // color: (theme) => theme.palette.primary.main,
                        position: 'relative',
                        zIndex: '101',
                        fontSize: '100px',
                        margin: '0 30px',
                    }}
                >
                    -
                </Box>
                <Box
                    sx={{
                        width: '400%',
                        height: '400%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // borderRadius: '50%',
                        // background: '#0066ff',
                        color: (theme) => theme.palette.primary.light,
                        // color: (theme) => theme.palette.primary.main,
                        position: 'relative',
                        zIndex: '101',
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M19 20C19 21.11 18.11 22 17 22C15.89 22 15 21.1 15 20C15 18.89 15.89 18 17 18C18.11 18 19 18.9 19 20M7 18C5.89 18 5 18.89 5 20C5 21.1 5.89 22 7 22C8.11 22 9 21.11 9 20S8.11 18 7 18M7.2 14.63L7.17 14.75C7.17 14.89 7.28 15 7.42 15H19V17H7C5.89 17 5 16.1 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2H4.27L5.21 4H20C20.55 4 21 4.45 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63M8.5 11H10V9H7.56L8.5 11M11 9V11H14V9H11M14 8V6H11V8H14M17.11 9H15V11H16L17.11 9M18.78 6H15V8H17.67L18.78 6M6.14 6L7.08 8H10V6H6.14Z" />
                    </svg>
                </Box>
                <Box
                    sx={{
                        // width: '400%',
                        height: '400%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // borderRadius: '50%',
                        // background: '#0066ff',
                        color: (theme) => theme.palette.primary.light,
                        // color: (theme) => theme.palette.primary.main,
                        position: 'relative',
                        zIndex: '101',
                        fontSize: '100px',
                        margin: '0 30px',
                    }}
                >
                    =
                </Box> */}
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // borderRadius: '50%',
                        // background: '#0066ff',
                        // color: (theme) => theme.palette.primary.light,
                        color: (theme) => theme.palette.primary.main,
                        position: 'relative',
                        zIndex: '101',
                    }}
                >
                    {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 458.5 458.5"
                        fill="currentColor"
                    >
                        <path d="M336.7 344c-22 0-39.9-18-39.9-39.9V238c0-22 18-39.8 39.9-39.8h105.7v-65.9c0-17-13.8-30.7-30.7-30.7h-381c-17 0-30.7 13.7-30.7 30.7v277.6c0 17 13.8 30.8 30.7 30.8h381c17 0 30.7-13.8 30.7-30.8V344H336.7z" />
                        <path d="M440.5 220H336.7c-10 0-18 8-18 18V304c0 10 8 18 18 18h103.8c10 0 18-8 18-18V238c0-10-8-18-18-18zm-68 77a26 26 0 1 1 0-52 26 26 0 0 1 0 52zM358.2 45.2A39.7 39.7 0 0 0 308 20L152 71.6h214.9l-8.7-26.4z" />
                    </svg> */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M19.83 7.5L17.56 5.23C17.63 4.81 17.74 4.42 17.88 4.08C17.96 3.9 18 3.71 18 3.5C18 2.67 17.33 2 16.5 2C14.86 2 13.41 2.79 12.5 4H7.5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10V19H12V21H17.5L19.18 15.41L22 14.47V7.5H19.83M13 9H8V7H13V9M16 11C15.45 11 15 10.55 15 10S15.45 9 16 9C16.55 9 17 9.45 17 10S16.55 11 16 11Z" />
                    </svg>
                </Box>
                <Coin
                    id={0}
                    delay={'0.3s'}
                    toX={'calc(-100px + 24px)'}
                    toY={'calc(-105px + 24px)'}
                />
                <Coin
                    id={1}
                    delay={'0.1s'}
                    toX={'calc(-70px + 24px)'}
                    toY={'-90px'}
                />
                <Coin
                    id={2}
                    delay={'0s'}
                    toX={'calc(-30px + 24px)'}
                    toY={'-125px'}
                />
                <Coin
                    id={3}
                    delay={'0.2s'}
                    toX={'calc(10px + 24px)'}
                    toY={'-130px'}
                />
                <Coin
                    id={4}
                    delay={'0.1s'}
                    toX={'calc(30px + 24px)'}
                    toY={'-100px'}
                />
                <Coin
                    id={6}
                    delay={'0.4s'}
                    toX={'calc(70px + 24px)'}
                    toY={'-95px'}
                />
                <Coin
                    id={7}
                    delay={'0.2s'}
                    toX={'calc(100px + 24px)'}
                    toY={'-100px'}
                />
            </Box>
        </Backdrop>
    );
};

export default Loader;
