import React from 'react';
import Wallet from '../sub-components/wallet/Wallet';
import ActiveRentals from './inner-components/ActiveRentals';
import OpenOrders from './inner-components/OpenOrders';
import Profile from './inner-components/Profile'
import Preferences from './inner-components/Prefrences'
import SalesHistory from './inner-components/SalesHistory';
import CurrentRentals from './inner-components/CurrentRentals';
import MiningOperations from './inner-components/MiningOperations';
import './home.css'

//todo: Tables - show current 5; if there is more than 5, 'Show more'. If none - display 'none'


const Home = props => {
    return (
        <main>   
            <Wallet />
            <Profile />
            <Preferences />
            <MiningOperations />
            <OpenOrders />
            <SalesHistory />
            <CurrentRentals />
        </main>
    );
};

export default Home;
