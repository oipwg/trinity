import React, { useState } from 'react';
import Navigation from './nav/Navigation';
import Main from './setup/Main';
import './trinity.css';


const Setup = () => {
    return (
        <div className="trinity">
            <Navigation />  
            <Main />
        </div>
    );
};

export default Setup;
