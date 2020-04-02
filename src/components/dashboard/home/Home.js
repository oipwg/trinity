import React from 'react';
import Wallet from '../sub-components/wallet/Wallet';
import ActiveRentals from './inner-components/ActiveRentals';
import OpenOrders from './inner-components/OpenOrders';
import Profile from './inner-components/Profile'
import Preferences from './inner-components/Prefrences'
import SalesHistory from './inner-components/SalesHistory';
import CurrentRentals from './inner-components/CurrentRentals';
import MiningOperations from './inner-components/MiningOperations';



const Home = props => {
    return (
        <main
            style={{
                margin: '0 auto',
                width: '85vw',
            }}
        >   
            <Profile />
            <Preferences />
            <Wallet />
            <ActiveRentals />
            <MiningOperations />
            <OpenOrders />
            <SalesHistory />
            <CurrentRentals />
        </main>
    );
};

export default Home;
