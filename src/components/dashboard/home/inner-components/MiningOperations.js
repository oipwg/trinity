import React from 'react';
import { Link } from 'react-router-dom';

let fakeState = {
    budget: 50.00,
    margin: 10,
    profitReinvestment: 37,
    updateUnsoldOffers: 'SCRYPT'
};

let { budget, margin, profitReinvestment, updateUnsoldOffers } = fakeState;

const MiningOperations = () => {
    return (
        <div className="card mining-operation">
            <div className="card-header">Mining Operations</div>
            <div className="card-body" 
            >

                <div style={{textAlign: 'center',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    <p>
                        Daily Budget
                    </p>
                <div
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        border: '1px solid black', 
                        alignItems: 'center',
                        paddingTop: '25px',
                        paddingBottom: '25px',
                        width: '250px',
                        backgroundColor: 'rgba(0,0,0,.2)',
                        margin: '10px auto'
                  }} 
                >
                    <h3>
                        $ {(budget).toFixed(2)} 
                    </h3>
                    <button
                        style={{width: '94px', marginLeft: '15px'}}
                        onClick={() => {
                            console.log('derp')
                        }}
                        type="button"
                        className="btn btn-primary"
                    >
                        Edit
                    </button>
                </div>
                    <Link to="#">Select Rental Markets, Mining Pools, & Exchanges</Link>

                <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                    <span>
                            <label htmlFor="targetMargin">Target Margin</label>
                            <input
                                type="number"
                                id="targetMargin"
                                name="targetMargin"
                                min="0"
                                max="100"
                                placeholder='10'
                            />
                            <input
                                type="number"
                                id="targetMargin"
                                name="targetMargin"
                                min="0"
                                max="100"
                                placeholder="%"
                                disabled
                            />
                        </span>
                        <span>
                            <label htmlFor="profitReinvest">Profit Reinvestment</label>

                            <input
                                type="number"
                                id="profitReinvest"
                                name="profitReinvest"
                                min="10"
                                max="100"
                                placeholder='10'
                            />
                            <input
                                type="number"
                                id="profitReinvest"
                                name="profitReinvest"
                                min="10"
                                max="100"
                                placeholder="%"
                                disabled
                            />
                        </span>
                        <span>
                            <label htmlFor="weeklyBudget">Weekly Budget</label>
                            <input
                                type="number"
                                id="weeklyBudget"
                                name="weeklyBudget"
                                min="10"
                                max="100"
                                placeholder="$"
                                disabled
                            />
                            <input
                                type="number"
                                id="weeklyBudget"
                                name="weeklyBudget"
                                min="10"
                                max="100"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiningOperations;
