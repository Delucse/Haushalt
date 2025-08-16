import Icon from '@mdi/react';
import { mdiPrinter } from '@mdi/js';

import { toPng } from 'html-to-image';
import { Box } from '@mui/material';
import { useRef } from 'react';
import Dashboard from './Dashboard';

import { useDispatch } from 'react-redux';

import jsPDF from 'jspdf';

import { snackbarMessage } from '../actions/messageActions';

// const PdfDocument = ({ content }) => {
//     console.log(content);
//     return (
//         <Document>
//             <Page
//                 size="A4"
//                 orientation="landscape"
//                 dpi="300"
//                 style={{ padding: '1cm' }}
//             >
//                 <Image
//                     style={{
//                         width: '277mm',
//                         height: '190mm',
//                     }}
//                     src={content}
//                     debug
//                 />
//             </Page>
//         </Document>
//     );
// };

const Print = () => {
    const dispatch = useDispatch();
    const ref = useRef();

    const generateDashboard = async () => {
        const dataUrl = await toPng(ref.current);
        // const svg = decodeURIComponent(dataUrl.split(',')[1]);
        return dataUrl;
    };

    // const onClick = async () => {
    //     const dashboard = await generateDashboard();
    //     const generatedPdf = pdf(<PdfDocument content={dashboard} />);
    //     const blob = await generatedPdf.toBlob();
    //     dispatch(
    //         snackbarMessage(
    //             'Deine angeforderte PDF wurde erfolgreich generiert.',
    //             `pdf-${Date.now()}`
    //         )
    //     );
    //     saveAs(blob, `export.pdf`);
    // };

    const onClick = async () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        doc.html(ref.current, {
            x: 10,
            y: 10,
            width: doc.internal.pageSize.width - 20,
            height: doc.internal.pageSize.height - 20,
            callback: function (doc) {
                dispatch(
                    snackbarMessage(
                        'Deine angeforderte PDF wurde erfolgreich generiert.',
                        `pdf-${Date.now()}`
                    )
                );
                doc.save('two-by-four.pdf');
            },
        });

        // const dashboard = await generateDashboard();
        // doc.addImage(
        //     dashboard,
        //     'PNG',
        //     10,
        //     10,
        //     doc.internal.pageSize.width - 20,
        //     doc.internal.pageSize.height - 20
        // );
        // dispatch(
        //     snackbarMessage(
        //         'Deine angeforderte PDF wurde erfolgreich generiert.',
        //         `pdf-${Date.now()}`
        //     )
        // );
    };

    return (
        <>
            <Box
                sx={{
                    position: 'sticky',
                    top: { xxs: 0, sm: '56px' },
                    marginTop: '-16px',
                    paddingTop: '16px',
                    background: (theme) => theme.palette.background.default,
                    zIndex: 1,
                }}
            >
                <Box
                    onClick={onClick}
                    sx={{
                        display: 'flex',
                        width: 'fit-content',
                        cursor: 'pointer',
                        color: (theme) => theme.palette.primary.light,
                        '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                >
                    <Icon path={mdiPrinter} size={1.4} />
                </Box>
            </Box>
            <Box
                sx={{
                    position: 'absolute',
                    left: -1684,
                    top: -1190,
                    width: '1684px',
                    height: '1190px',
                }}
            >
                <Box
                    ref={ref}
                    sx={{
                        position: 'relative',
                    }}
                >
                    <Dashboard print />
                </Box>
            </Box>
        </>
    );
};

export default Print;
