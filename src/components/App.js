import React, { useEffect } from 'react';
import Login from './login/Login';
import SignUp from './signup/SignUp';
import SpartanBot from './spartanbot/SpartanBot';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ResetPassword from './resetPassword/ResetPassword';
import Home from './home/Home';

import { loadUser } from '../actions/authActions';
import { connect } from 'react-redux';

const App = props => {
    console.log(props);

    useEffect(() => {
        props.loadUser();
    }, []);

    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/signup" component={SignUp} />
                <Route path="/login" component={Login} />
                <Route path="/resetpassword" component={ResetPassword} />
                <Route path="/setup" component={SpartanBot} />
            </Switch>
        </Router>
    );
};

// todo: maybe enforce props type?
//
// SignUp.propTypes = {
//     isAuthneticated: PropTypes.bool,
//     error: PropTypes.object.isRequired,
//     signup: PropTypes.func.isRequired,
// };

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        error: state.error,
    };
};

export default connect(mapStateToProps, { loadUser })(App);
