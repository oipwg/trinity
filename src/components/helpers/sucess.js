import React from 'react';

const RenderSuccess = ({ message }) => {
    return (
        <div className="alert alert-success" role="alert">
            {message}
            <span role="img" aria-label="thumbs-up">
                {' '}
                👍
            </span>
        </div>
    );
};

export default RenderSuccess;
