import React from 'react';

const WalletBalanceBreakdown = ({ localFlo, localBtc, mrr, nicehash }) => {
    return (
        <div className="minicard">
            <div className="card">
                <div className="card-header">Local</div>
                <div className="card-body" style={{ display: 'flex' }}>
                    <div>
                        <p>{localFlo} flo</p>
                        <p>{localBtc} btc</p>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">MRR</div>
                <div className="card-body" style={{ display: 'flex' }}>
                    <div>
                        <p>$ {mrr}</p>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">NiceHash</div>
                <div className="card-body" style={{ display: 'flex' }}>
                    <div>
                        <p>$ {nicehash}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletBalanceBreakdown;
