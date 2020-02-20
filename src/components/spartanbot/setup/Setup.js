import React, { useState } from 'react';
import Navigation from '../nav/Navigation';
import './setup.css';

const Setup = () => {
    return (
        <section className="wizard">
            <form>
                <div className="form-inline rental-provider">
                    <h4>Provider</h4>
                    <div className="form-groups">
                        <label className="my-1 mr-2">Rental provider</label>
                        <select className="custom-select mx-sm-4">
                            <option defaultValue value="">
                                Select provider
                            </option>
                            <option value="MiningRigRentals">
                                MiningRigRentals
                            </option>
                            <option value="NiceHash">NiceHash</option>
                        </select>
                    </div>
                </div>
                <div className="provider-credentials">
                    <h4>Provider Credentials</h4>
                    <div className="form-inline API-key">
                        <div className="form-groups">
                            <label htmlFor="key">API key</label>
                            <input
                                type="password"
                                id="key"
                                className="form-control mx-sm-4"
                                aria-describedby="key"
                                placeholder="Your api key"
                            />
                        </div>
                    </div>
                    <div className="form-inline secret">
                        <div className="form-groups">
                            <label htmlFor="mmr-secret">Secret</label>
                            <input
                                type="password"
                                id="mmr-secret"
                                className="form-control mx-sm-4"
                                aria-describedby="mmr-secret"
                                placeholder="Your secret"
                            />
                        </div>
                    </div>
                </div>
                {/* End of rental passwords */}
                <div className="pool-add">
                    <h4>Add A Pool</h4>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label className="my-1 mr-2">Type</label>
                            <select className="custom-select mx-sm-4">
                                <option defaultValue value="">
                                    Select Algorithm
                                </option>
                                <option value="Scrypt">Scrypt</option>
                                <option value="X16rv2">X16rv2</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label htmlFor="name">Pool name</label>
                            <input
                                type="text"
                                id="pool-name"
                                className="form-control mx-sm-4"
                                aria-describedby="name"
                                placeholder="Pool name"
                            />
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label htmlFor="Port">Host</label>
                            <input
                                type="text"
                                id="port"
                                className="form-control mx-sm-4"
                                aria-describedby="algorithm"
                                placeholder="Port"
                            />
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label htmlFor="wallet">Wallet</label>
                            <input
                                type="text"
                                id="wallet"
                                className="form-control mx-sm-4"
                                aria-describedby="Wallet address"
                                placeholder="Wallet address"
                            />
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label htmlFor="pool-password">Password</label>
                            <input
                                type="text"
                                id="pool-password"
                                className="form-control mx-sm-4"
                                aria-describedby="pool password"
                                placeholder="Password usually x"
                            />
                        </div>
                    </div>
                    <div className="form-inline">
                        <div className="form-groups">
                            <label htmlFor="pool-notes">Notes</label>
                            <input
                                type="text"
                                id="pool-notes"
                                className="form-control mx-sm-4"
                                aria-describedby="pool-notes"
                                placeholder="Notes"
                            />
                        </div>
                    </div>
                </div>{' '}
                {/* End of pool information */}
                <button type="submit" className="btn-submit">
                    Submit
                </button>
            </form>
        </section>
    );
};
export default Setup;
