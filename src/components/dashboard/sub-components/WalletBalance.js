import React from 'react';

const WalletBalance = () => {
    let fakeState = {
        usd: 275.45,
        btc: 0.000004838,
    };

    let { usd, btc } = fakeState;
    return (
        <div className="card">
            <div className="card-header">Wallet</div>
            <div className="card-body" style={{ display: 'flex' }}>
                <div>
                    <h3>$ {usd}</h3>
                    <span>({btc}) BTC</span>
                </div>
                <div>
                    <button type="button" className="btn btn-primary">
                        Deposit
                    </button>
                    <button type="button" className="btn btn-light">
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletBalance;
