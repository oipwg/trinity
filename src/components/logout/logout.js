import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { logoutUser } from '../../actions/authActions';

const Logout = props => {
    useEffect(() => {
        props.logoutUser(props.history);
    }, []);

    return <div>Logout...</div>;
};

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        error: state.error,
        user: state.user,
    };
};

export default connect(mapStateToProps, { logoutUser })(Logout);
