import React, { useEffect } from 'react';
import SpartanBot from './spartanbot/SpartanBot';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './home/Home';
import NavBar from './navbar/navbar';
import Login from './login/Login';
import Logout from './logout/Logout';
import SignUp from './signup/SignUp';
import ChangePassword from './changePassword/ChangePassword';
import Dashboard from './dashboard/Dashboard';
import NoMatch404 from './noMatch404/noMatch404';

import { loadUser } from '../actions/authActions';
import { connect } from 'react-redux';

import PrivateRoute from './PrivateRoute';

// todo: after login redirect to orginal page

const App = props => {
    useEffect(() => {
        props.loadUser();
    }, [!props.user]);

    return (
        <Router>
            <NavBar user={props.user} />
            <Switch>
                {/* Public Routes */}
                <Route path="/" exact component={Home} />
                {/* Testing */}
                <Route
                    path="/dashboard"
                    component={Dashboard}
                    isAuthenticated={props.isAuthenticated}
                />
                <Route path="/login" component={Login} />
                <Route path="/signup" component={SignUp} />
                <Route path="/logout" component={Logout} />

                {/* Only if isAuthenticated */}
                {/* <PrivateRoute
                    path="/dashboard"
                    component={Dashboard}
                    isAuthenticated={props.isAuthenticated}
                /> */}
                <PrivateRoute
                    path="/changePassword"
                    component={ChangePassword}
                    isAuthenticated={props.isAuthenticated}
                />
                <PrivateRoute
                    path="/setup"
                    component={SpartanBot}
                    isAuthenticated={props.isAuthenticated}
                />

                {/* 404 */}
                <Route path="*">
                    <NoMatch404 />
                </Route>
            </Switch>
        </Router>
    );
};

// todo: maybe enforce props type?

// SignUp.propTypes = {
//     isAuthneticated: PropTypes.bool,
//     error: PropTypes.object.isRequired,
//     signup: PropTypes.func.isRequired,
// };

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        error: state.error,
        user: state.auth.user,
    };
};

export default connect(mapStateToProps, { loadUser })(App);
