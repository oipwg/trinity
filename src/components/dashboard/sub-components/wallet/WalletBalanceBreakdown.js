import React from 'react';

const WalletBalanceBreakdown = ({ localFlo, localBtc, localRvn, mrr, nicehash, bittrex }) => {
    return (
        <div className="minicard">
            <div className="card">
                <div className="card-header">Local</div>
                <div className="card-body" style={{ display: 'flex' }}>
                    <div>
                        <p>{localFlo} flo</p>
                        <p>{localBtc} btc</p>
                        <p>{localRvn} rvn</p>
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
            <div className="card">
                <div className="card-header">Bittrex</div>
                <div className="card-body" style={{ display: 'flex' }}>
                    <div>
                        {bittrex &&
                            Object.keys(bittrex).map((k, i) => {

                                if(bittrex[k].Currency === 'BTXCRD'){
                                    return;
                                }

                                let balance = bittrex[k].Balance

                                if(balance !== 0){
                                    balance = balance.toFixed(8)
                                }

                               return <p key={i}>{balance} {bittrex[k].Currency.toLowerCase()}</p>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletBalanceBreakdown;
