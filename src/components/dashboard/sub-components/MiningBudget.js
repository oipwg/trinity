import React from 'react';
import './subcomponent.css';
import { Link } from 'react-router-dom';

const MiningBudget = () => {
    return (
        <div className="card mining-budget">
            <div className="card-header">Mining Budget</div>
            <div className="card-body">
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
                <Link to="#">Settings</Link>
                <Link to="#">Learn More</Link>
            </div>
        </div>
    );
};

export default MiningBudget;
