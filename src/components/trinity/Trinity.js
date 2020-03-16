import React, { useState } from 'react';
import Navigation from './nav/Navigation';
import Setup from './setup/Setup';
import './trinity.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const Trinity = () => {
    return (
        <div className="trinity">
            <Navigation />
            <Setup />
        </div>
    );
};

export default Trinity;
