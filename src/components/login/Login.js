import React, { useState } from 'react';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onFormSubmit = e => {
        e.preventDefault();
        console.log(e.target);
        handleLogin();
    };

    console.log('username', username);
    console.log('password', password);

    const handleLogin = async () => {
        if (username && password)
            try {
                const response = await fetch(
                    'http://localhost:5000/users/login',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userName: username,
                            password: password,
                        }),
                    }
                );
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error(error);
            }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center">
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
                                    type="text"
                                    className="form-control"
                                    placeholder="username"
                                    onChange={e => {
                                        setUsername(e.target.value);
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
                                    type="password"
                                    className="form-control"
                                    placeholder="password"
                                    onChange={e => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
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
                            Don't have an account?<a href="#">Sign Up</a>
                        </div>
                        <div className="d-flex justify-content-center">
                            <a href="#">Forgot your password?</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
