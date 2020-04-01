import React from 'react';
import Wallet from '../sub-components/Wallet';
import ActiveRentals from '../sub-components/ActiveRentals';
import MiningBudget from '../sub-components/MiningBudget';
import OpenOrders from '../sub-components/OpenOrders';
import Profile from '../sub-components/Profile'
import Preferences from '../sub-components/Prefrences'
import SalesHistory from '../sub-components/SalesHistory';
import CurrentRentals from '../sub-components/CurrentRentals';



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
            <MiningBudget />
            <OpenOrders />
            <SalesHistory />
            <CurrentRentals />
        </main>
    );
};

export default Home;
