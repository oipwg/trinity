import React, { useState } from 'react';
import Navigation from './nav/Navigation';
import Main from './setup/Main';
import './trinity.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const Setup = () => {
    return (
        <div className="trinity">
            <Navigation />
            <Main />
        </div>
    );
};

export default Setup;
