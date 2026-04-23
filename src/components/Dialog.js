import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Icon from '@mdi/react';
import { mdiArrowLeft, mdiClose } from '@mdi/js';

import IconButton from './IconButton';

const DialogTitle = (props) => {
    return (
        <MuiDialogTitle
            sx={{
                margin: 0,
                padding: 2,
                paddingBottom: props.noPadding ? 0 : '10px',
                display: 'flex',
                ...props.sx,
            }}
        >
            {props.backIcon ? (
                <IconButton
                    tooltipProps={{ title: 'zurück zur Startseite' }}
                    onClick={props.onBack}
                    sx={{
                        float: 'left',
                        height: '40px',
                        marginTop: -0.5,
                        color: (theme) => theme.palette.primary.light,
                        '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                >
                    <Icon path={mdiArrowLeft} size={1} />
                </IconButton>
            ) : null}
            <div style={{ flexGrow: 1 }}>{props.children}</div>
            {props.closeIcon ? (
                <IconButton
                    onClick={props.onClose}
                    sx={{
                        height: '40px',
                        marginTop: -0.5,
                        color: (theme) => theme.palette.primary.light,
                        '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                        },
                    }}
                >
                    <Icon path={mdiClose} size={1} />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
};

function Dialog(props) {
    return (
        <MuiDialog
            disableScrollLock={false}
            open={props.open}
            PaperProps={{
                sx: {
                    borderRadius: 0,
                    color: (theme) => theme.palette.text.primary,
                    width: props.width
                        ? `calc(${props.width} + 2 * 16px)`
                        : props.fullWidth
                          ? '100%'
                          : 'unset',
                    margin: props.position
                        ? '24px'
                        : props.fullScreen
                          ? 0
                          : '32px',
                    ...props.sx,
                },
            }}
            fullScreen={props.fullScreen}
            fullWidth={props.fullWidth}
            maxWidth={props.maxWidth}
            onClose={props.onClose}
            sx={{
                zIndex: (theme) => theme.zIndex.dialog,
                top: props.position?.includes('bottom') ? 'unset' : 0,
                right: props.position?.includes('left') ? 'unset' : 0,
                bottom: props.position?.includes('top') ? 'unset' : 0,
                left: props.position?.includes('right') ? 'unset' : 0,
            }}
            TransitionComponent={props.transition}
        >
            {!props.fullScreen && (
                <DialogTitle
                    onClose={props.onClose}
                    closeIcon={props.closeIcon}
                    onBack={props.onBack}
                    backIcon={props.backIcon}
                    noPadding={props.noPadding}
                    sx={props.sxTitle}
                >
                    {props.title}
                </DialogTitle>
            )}
            {props.content && (
                <DialogContent
                    sx={{
                        margin: 0,
                        padding: props.fullScreen ? 0 : 2,
                        ...props.sxContent,
                        paddingBottom:
                            props.actions || props.fullScreen ? 0 : 2,
                    }}
                >
                    {props.content}
                </DialogContent>
            )}
            {props.actions ? (
                <DialogActions
                    sx={{
                        margin: 0,
                        padding: 2,
                        ...props.sxActions,
                    }}
                >
                    {props.actions}
                </DialogActions>
            ) : null}
        </MuiDialog>
    );
}

export default Dialog;
