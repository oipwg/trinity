import React from 'react';
import Wallet from '../sub-components/Wallet';
import CurrentRentals from '../sub-components/CurrentRentals';
import MiningBudget from '../sub-components/MiningBudget';
import OpenOrders from '../sub-components/OpenOrders';

// this into Redux/Dispatch?
import {
    listPaymentMethods,
    placeBuyOrderWithoutFees,
    placeBuyOrderWithFees,
    listBuysForAnAcc,
    listAccounts,
    placeSellOrderWithoutFees,
    placeSellOrderWithFees,
    withDrawFunds,
    listAddysforAccount,
    showOneAddyforAccount,
    sendFunds,
} from './coinbaseApi';

const BASE_URL = window.location.origin;

let COINBASE_REDIRECT_URL = 'http://localhost:8080/dashboard';

const scopes = `wallet:user:read wallet:user:email`;

const Home = props => {
    const clickIt = () => {
        // todo: move all this to redux? 🤷🏽‍♂️
        // Working
        // listAccounts(); //coinbase - wallet accounts BTC, ETH, USD, etc.,
        // --
        // placeBuyOrderWithoutFees('2.00', 'USD'); // quote default
        // placeBuyOrderWithFees(null, '2.00', 'USD'); // quote default
        // --
        // placeSellOrderWithoutFees('1.00', 'USD');
        // placeSellOrderWithFees(null, '2.00', 'USD');
        // --
        // withDrawFunds(
        //     '32de22c2-5513-543f-85c7-1d2f968bb922',
        //     '0.01',
        //     'USD',
        //     'd80982a6-0d39-56e6-bfca-2042d90fbb4a'
        // ); // at least $!
        // listPaymentMethods();
        // listBuysForAnAcc();
        // sendFunds(
        //     '1PSuvt641rsJm4RF4swAxMAa4zhNpzqJLt',
        //     '1.00',
        //     'USD',
        //     'testing',
        //     null,
        //     'testuno'
        // );
        //! Not Working
        //todo: Testing
        // listAddysforAccount();
        // showOneAddyforAccount();
        //!
    };

    return (
        <main
            style={{
                margin: '0 auto',
                width: '85vw',
            }}
        >
            <div>
                <Wallet />
                <CurrentRentals />
            </div>

            <MiningBudget />
            <OpenOrders />
        </main>
    );
};

export default Home;
