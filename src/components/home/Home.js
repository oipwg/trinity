import React from 'react';
import logo from '../../../public/images/alexandria/bookmark-3k.png';
import { useSpring, animated } from 'react-spring';

const Home = () => {
    const props = useSpring({
        opacity: 0.1,
        from: { opacity: 0 },
        duration: 1000,
        easing: 'ease-in',
    });

    return (
        <animated.div style={props}>
            <div
                style={{
                    // prettier-ignore
                    height: '100vh',
                    backgroundImage: `url(${logo})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <h1 style={{}}>ALEXANDRIA</h1>
            </div>
        </animated.div>
    );
};

export default Home;
