import React from 'react';

import WalletBalance from '../sub-components/WalletBalance';
import CurrentRentals from '../sub-components/CurrentRentals';
import MiningBudget from '../sub-components/MiningBudget';
import axios from 'axios';
import {
    API_URL,
    COINBASE_CLIENT_ID,
    COINBASE_REDIRECT_URL,
    COINBASE_SECURE_RANDOM,
} from '../../../../config';

const Home = () => {
    const handleClick = () => {
        axios
            .get(
                `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${COINBASE_CLIENT_ID}&redirect_uri=redirect_uri&state=state&scope=wallet:accounts:read`
            )
            .then(res => {
                console.log(res);
                return res.body;
            })
            .catch(err => {
                console.log(err);
            });
    };

    return (
        <main
            style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '10px',
            }}
        >
            <a
                href={`https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${COINBASE_CLIENT_ID}&redirect_uri=${COINBASE_REDIRECT_URL}&state=state&scope=wallet:accounts:read`}
            >
                Sign in with coinbase
            </a>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '10px',
                }}
            >
                <WalletBalance />
                <CurrentRentals />
                <div>
                    <MiningBudget />
                </div>
            </div>
        </main>
    );
};

export default Home;
