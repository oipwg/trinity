import React from 'react';

const Home = props => {
    const handleClick = () => {
        props.history.push('/login');
    };

    return (
        <div>
            <h1>Spartan Bot Yo!</h1>
            <button onClick={handleClick}>Click Me</button>
        </div>
    );
};

export default Home;
