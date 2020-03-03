import React from 'react';

const CurrentRentals = () => {
    let fakeState = {
        ghz: 25,
        rigs: 3,
        cost: 37,
    };

    let { ghz, rigs, cost } = fakeState;

    return (
        <div className="card">
            <div className="card-header">Current Rentals</div>
            <div className="card-body" style={{ display: 'flex' }}>
                <div>
                    <div className="card-body">
                        <p className="card-title">Hashes</p>
                        <h3 className="card-text">{ghz} GH/s</h3>
                    </div>
                </div>
                <div>
                    <div className="card-body">
                        <p className="card-title">Rigs</p>
                        <h3 className="card-text">{rigs}</h3>
                    </div>
                </div>
                <div>
                    <div className="card-body">
                        <p className="card-title">Cost</p>
                        <h3 className="card-text">$ {cost}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentRentals;
