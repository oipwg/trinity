import React from 'react';
import './subcomponent.css';
import { Link } from 'react-router-dom';

let fakeState = {
    budget: 50.00,
    margin: 10,
    profitReinvestment: 37,
    updateUnsoldOffers: 'SCRYPT'
};

let { budget, margin, profitReinvestment, updateUnsoldOffers } = fakeState;

const MiningBudget = () => {
    return (
        <div className="card mining-budget">
            <div className="card-header">Mining Operations</div>
            <div className="card-body">
                    Daily Budget
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
                  }} 
                >
                    <h3>
                        $ {(budget).toFixed(2)} 
                    </h3>
                    <button
                        style={{width: '94px'}}
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

                <div>
                    <label htmlFor="targetMargin">Target Margin</label>
                    <input
                        type="number"
                        id="targetMargin"
                        name="targetMargin"
                        min="0"
                        max="100"
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
                </div>
                <div>
                    <label htmlFor="profitReinvest">Profit Reinvestment</label>

                    <input
                        type="number"
                        id="profitReinvest"
                        name="profitReinvest"
                        min="10"
                        max="100"
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
                </div>
                <div>
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
                </div>
            </div>
        </div>
    );
};

export default MiningBudget;
