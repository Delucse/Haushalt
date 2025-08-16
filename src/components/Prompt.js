import { useEffect } from 'react';

const Prompt = () => {
    useEffect(() => {
        window.addEventListener('beforeunload', alertUser);
        return () => {
            window.removeEventListener('beforeunload', alertUser);
        };
    }, []);

    const alertUser = (e) => {
        e.preventDefault();
        e.returnValue = '';
    };
};

export default Prompt;
