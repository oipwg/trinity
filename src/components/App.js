import React from 'react';
import Login from './login/Login';
import SignUp from './signup/SignUp';
import Trinity from './trinity/Trinity';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact>
                    <SignUp />
                </Route>
                <Route path="/setup">
                    <Trinity />
                </Route>
            </Switch>
        </Router>
    );
};
export default App;
