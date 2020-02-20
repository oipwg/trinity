import React, { useState } from 'react';
import Navigation from './nav/Navigation';
import Setup from './setup/Setup';
import './spartanbot.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const SpartanBot = () => {
    return (
        <div className="trinity">
            <Navigation />
            <Setup />
        </div>
    );
};

export default SpartanBot;
