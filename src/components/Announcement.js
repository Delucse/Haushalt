import { Backdrop, Box } from '@mui/material';
import Typewriter from 'typewriter-effect';

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
                background: '#076428',
                display: 'grid',
            }}
        >
            <Box
                sx={{
                    fontSize: '35px',
                    mb: '100px',
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                Haushalt{' '}
                <span style={{ fontFamily: 'LobsterTwo-Bold' }}>Delucse</span>
            </Box>
            <Box
                sx={{
                    width: '100px',
                    height: '100px',
                    position: 'relative',
                    margin: 'auto',
                }}
                id="wallet"
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#70b87c',
                        position: 'relative',
                        zIndex: '101',
                    }}
                >
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
            <Box sx={{ textAlign: 'center', color: 'white', fontSize: '25px' }}>
                <Typewriter
                    onInit={(typewriter) => {
                        typewriter
                            .typeString('jetzt verfü')
                            .pauseFor(200)
                            .deleteChars('jetzt verfü'.length)
                            // .pasteString(
                            //     '<span style="text-decoration: line-through;">jetzt</span>'
                            // )
                            .typeString('bald verfügbar')
                            .pauseFor(2000)
                            .typeString('<br/>vielleicht')
                            .pauseFor(750)
                            .typeString(' hoffentlich...')
                            .deleteAll()
                            .typeString('<b>2026</b> verfügbar')
                            .pauseFor(1000)
                            .typeString('!')
                            .start();
                    }}
                />
            </Box>
        </Backdrop>
    );
};

export default Loader;
