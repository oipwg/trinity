import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props =>
                rest.isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: '/',
                            state: { from: props.location },
                        }}
                    />
                )
            }
        />
    );
};

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthenticated,
        error: state.error,
    };
};

export default connect(mapStateToProps)(PrivateRoute);
