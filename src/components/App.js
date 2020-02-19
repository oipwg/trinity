import React from 'react';
import Login from './login/Login';
import SignUp from './signup/SignUp';
import Setup from './setup/Setup';
import { Switch, BrowserRouter, Route } from 'react-router-dom';

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                {/* <Login /> */}
                <Route path="/" exact>
                    <SignUp />
                </Route>
                <Route path="/setup">
                    <Setup />
                </Route>
            </Switch>
        </BrowserRouter>
    );
};
export default App;
