import React from 'react';
import logo from '../../../public/images/alexandria/bookmark-3k.png';

const Home = () => {
    return (
        <div
            style={{
                // prettier-ignore
                opacity: '0.05',
                height: '100vh',
                backgroundImage: `url(${logo})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <h1 style={{}}>ALEXANDRIA</h1>
        </div>
    );
};

export default Home;
