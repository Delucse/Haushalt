import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { elementToSVG } from 'dom-to-svg';

import PDFDocument from '@react-pdf/pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

import { saveAs } from 'file-saver';

import Icon from '@mdi/react';
import { mdiPrinter } from '@mdi/js';

import { Box, useMediaQuery } from '@mui/material';

import IconButton from './IconButton';
import Dashboard from './Dashboard';

const Print = () => {
    const [active, setActive] = useState(false);

    const themeMode = useSelector((state) => state.settings.theme.mode);
    const systemModeIsDark = useMediaQuery('(prefers-color-scheme: dark)');
    const mode =
        themeMode === 'system'
            ? systemModeIsDark
                ? 'dark'
                : 'light'
            : themeMode;

    const createSvg = () =>
        new Promise((resolve, reject) => {
            // Get all canvas elements
            const canvases = document
                .getElementById('dashboard-print')
                .querySelectorAll('canvas');
            // Loop through each canvas
            canvases.forEach((canvas, index) => {
                // Create a temporary canvas to draw the image
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const rect = canvas.getBoundingClientRect();
                const scaleX = rect.width / canvas.width;
                const scaleY = rect.height / canvas.height;
                const tempContext = tempCanvas.getContext('2d');
                tempContext.drawImage(canvas, 0, 0);
                // Get the PNG data URL from the temporary canvas
                const pngDataUrl = tempCanvas.toDataURL('image/png');
                // Create a new image element with the PNG data URL
                const img = document.createElement('img');
                img.src = pngDataUrl;
                img.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
                img.style.transformOrigin = '0 0';
                // Replace the canvas with the image
                canvas.parentNode.replaceChild(img, canvas);
            });

            setTimeout(() => {
                const svgDocument = elementToSVG(
                    document.getElementById('dashboard-print'),
                );
                const svgString = new XMLSerializer().serializeToString(
                    svgDocument,
                );
                resolve(svgString);
            }, 1000);
        });

    const createPdf = (svg) =>
        new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                info: {
                    Title: 'Haushalt Delucse',
                    Author: window.location.origin,
                    Subject: 'Haushalt',
                    Keywords: 'Haushalt, Delucse',
                    CreationDate: new Date(),
                },
            });
            const chunks = [];
            doc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            SVGtoPDF(doc, svg, 12, 12);
            doc.on('end', () => {
                const resultBlob = new Blob(chunks, {
                    type: 'application/pdf',
                });
                saveAs(resultBlob, 'Haushalt_Delucse.pdf');
                resolve();
            });
            doc.end();
        });

    useEffect(() => {
        if (active) {
            createSvg().then((svg) =>
                createPdf(svg).then(() => setActive(false)),
            );
        }
    }, [active]);

    return (
        <>
            <IconButton
                sx={{ width: '100%', height: '100%' }}
                onClick={() => setActive(true)}
                disabled={active}
            >
                <Icon path={mdiPrinter} size={'min(100%, 48px)'} />
            </IconButton>
            <Box
                id="print"
                sx={{
                    position: 'absolute',
                    top: '-793.71px',
                    width: 'calc(1122.52px - 2 * 16px)',
                    left: '-1122.52px',
                    height: 'calc(793.71px - 2 * 16px)',
                    padding: '16px',
                }}
            >
                {active && <Dashboard print={mode} />}
            </Box>
        </>
    );
};

export default Print;
