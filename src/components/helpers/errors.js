import React from 'react';

const RenderError = ({ message }) => {
    return (
        <div className="alert alert-danger" role="alert">
            {message}
            <span role="img" aria-label="thumbs-down">
                {' '}
                👎
            </span>
        </div>
    );
};

export default RenderError;
