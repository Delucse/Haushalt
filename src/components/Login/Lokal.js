import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setFilesLocale } from '../../actions/fileActions';

import { useNavigate } from 'react-router-dom';

import moment from 'moment';

import Button from '../Button';
import Alert from '../Alert';
import Loader from '../Loader';

const Lokal = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const error = useSelector((state) => state.message.error);
    const progress = useSelector((state) => state.dataframe.progress);

    useEffect(() => {
        if (progress === false && !error) {
            navigate('/dashboard', {
                replace: true,
                state: { timestamp: moment().valueOf() },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress, error]);

    return progress === null ? (
        <>
            <Alert type={['localeImport']} style={{ marginBottom: '20px' }} />
            <Button
                onClick={() => dispatch(setFilesLocale())}
                variant="contained"
                fullWidth
            >
                lokalen ZIP-Ordner uploaden
            </Button>
        </>
    ) : (
        <Loader />
    );
};

export default Lokal;
