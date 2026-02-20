import { useSelector } from 'react-redux';

import { Navigate } from 'react-router-dom';

function PrivateRoute(props) {
    const isAuthenticated = useSelector(
        (state) => state.auth.token || state.auth.type === 'lokal',
    );

    if (isAuthenticated) {
        return props.children;
    } else {
        return <Navigate to="/beta" />;
    }
}

export default PrivateRoute;
