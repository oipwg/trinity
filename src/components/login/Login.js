import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorAction';

import './login.css';

const Login = props => {
    /**************************STATE SECTION************************/
    //**Display Name State */
    const [username, setUsername] = useState(null);

    //**Password State */
    const [password, setPassword] = useState('');

    //**Error State */
    const [error, setError] = useState(null);

    useEffect(() => {
        if (props.error.id === 'LOGIN_FAIL') {
            return setError('Invalid Credentials');
        }
    }, [props.error.id]);

    const onFormSubmit = e => {
        e.preventDefault();
        try {
            const user = {
                userName: username,
                password: password,
            };

            props.loginUser(user, props.history);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            id="login-card"
            className=" d-flex justify-content-center align-items-center"
        >
            <div className="">
                <div className="card">
                    <div className="card-header">
                        <h3>Sign In</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={onFormSubmit} value="submit">
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-user"></i>
                                    </span>
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    placeholder="username"
                                    onChange={e => {
                                        setUsername(e.target.value);
                                        props.clearErrors();
                                    }}
                                />
                            </div>
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-key"></i>
                                    </span>
                                </div>
                                <input
                                    required
                                    type="password"
                                    className="form-control"
                                    placeholder="password"
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        props.clearErrors();
                                    }}
                                />
                            </div>
                            {/***** ERROR MESSAGE  *****/}
                            {props.error.id && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}
                            <div className="row align-items-center remember">
                                <input type="checkbox" />
                                Remember Me
                            </div>
                            <div className="form-group">
                                <input
                                    type="submit"
                                    value="Login"
                                    className="btn float-right login_btn"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="card-footer">
                        <div className="d-flex justify-content-center links">
                            Don't have an account?
                            <Link
                                to="/signup"
                                onClick={() => {
                                    props.clearErrors();
                                }}
                            >
                                Sign Up
                            </Link>
                        </div>
                        <div className="d-flex justify-content-center">
                            {/* <a href="#">Forgot your password?</a> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        error: state.error,
        user: state.user, //state.auth.user
    };
};

export default connect(mapStateToProps, { loginUser, clearErrors })(Login);
