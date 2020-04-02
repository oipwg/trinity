import React from 'react';
import { crypto } from '../../../../helpers-functions/cryptoCurrencies';


const ActiveRentals = () => {
    let fakeState = {
        ghz: 25,
        rigs: 3,
        cost: 37,
        algo: 'SCRYPT'
    };

    let { ghz, rigs, cost, algo } = fakeState;

    return (
        <div className="card">
            <div className="card-header">Active Rentals</div>
            <div className="card-body" style={{ display: 'flex',
                justifyContent: 'space-evenly' }}>
                <div style={{textAlign: 'center'}}>
                    <img src={crypto.flo.icon} alt={crypto.flo.name} width='88px' />
                    <p>FLO</p>
                    <div style={{ 
                        border: '1px solid black',
                        backgroundColor: 'rgba(0,0,0,.2)',
                        width: '240px',
                    }}>
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <p>Hashes</p>
                            <span>
                            <h3>{ghz} MH/s</h3>
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-evenly',
                                }}
                            >
                                <span>
                                    <p>Rigs</p>
                                    <h4>
                                    {rigs}
                                    </h4>
                                </span>
                                <span>
                                    <p>Cost</p>
                                    <h4>
                                        ${cost}
                                    </h4> 
                                </span>
                                <span>
                                    <p>Algorithm </p>
                                    <h4>
                                        {algo}
                                    </h4>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
                <div style={{textAlign: 'center'}}>
                    <img src={crypto.raven.altIcon} alt={crypto.raven.name} width='88px' />
                    <p>RVN</p>
                    <div style={{ 
                        border: '1px solid black',
                        backgroundColor: 'rgba(0,0,0,.2)',
                        width: '240px',
                    }}>
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <p>Hashes</p>
                            <span>
                            <h3>{ghz} MH/s</h3>
                            </span>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-evenly',
                                }}
                            >
                                <span>
                                    <p>Rigs</p>
                                    <h4>
                                        {rigs}
                                    </h4>
                                </span>
                                <span>
                                    <p>Cost</p>
                                    <h4>
                                        ${cost}
                                    </h4>
                                </span>
                                <span>
                                    <p>Algorithm </p>
                                    <h4>
                                        {algo}
                                    </h4>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveRentals;
