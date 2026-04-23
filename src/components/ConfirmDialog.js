import Dialog from './Dialog';
import Button from './Button';

const ConfirmDialog = ({ open, onClose, payload }) => {
    const { title, message, no, yes } = payload;
    return (
        <Dialog
            open={open}
            maxWidth={'xs'}
            fullWidth
            sx={{ margin: '40px' }}
            title={title}
            content={message}
            actions={
                <>
                    <Button onClick={() => onClose(false)} variant="outlined">
                        {no || 'Nein'}
                    </Button>
                    <Button onClick={() => onClose(true)} variant="contained">
                        {yes || 'Ja'}
                    </Button>
                </>
            }
        />
    );
};
export default ConfirmDialog;
