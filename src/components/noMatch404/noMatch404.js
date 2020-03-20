import React from 'react';
import { useLocation } from 'react-router-dom';

const NoMatch404 = () => {
    let location = useLocation();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10vh',
            }}
        >
            <h3>
                404: No match for <code>{location.pathname}</code>
            </h3>
        </div>
    );
};

export default NoMatch404;
