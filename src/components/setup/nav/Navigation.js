import React, { useState } from 'react';
import './nav.css';

const Navigation = () => {
    return (
        <nav className='nav-setup'>
            <header>
                <h5 className="nav-header">SETUP</h5>
            </header>
            <div className="nav-item-container">
                
                <ul>
                    <li className="nav-item">Show Providers</li>
                    <li className="nav-item">Update Provider</li>
                    <li className="nav-item">Update Bittrex</li>
                    <li className="nav-item">Profile</li>
                    <li className="nav-item">Wallet</li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
