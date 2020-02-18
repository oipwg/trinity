import React, { useState } from 'react';
import './signup.css';
import Login from '../login/Login';

const SignUp = () => {
    /**************************STATE SECTION************************/
    //**Display Name States */
    const [username, setUsername] = useState('');
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('');

    //**Password States */
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [passErrorMessage, setPassErrorMessage] = useState('');

    //**Email States */
    const [email, setEmail] = useState('');

    // todo:
    /**
     * 
     *   const [walletRecord, setWalletRecord] = useState({
    mnemonic: '',
    encryption: '',
    signed64: ''
  });
     */

    const onFormSubmit = e => {
        e.preventDefault();
        console.log(e.target);
        validateForm(e);
    };

    console.log({ username, password, rePassword, email });
    console.log({ usernameErrorMessage, passErrorMessage });

    /****** Function to compare password, usename, fields */

    const validateForm = e => {
        if (username) {
            setUsernameErrorMessage('Enter username');
        } else if (password !== rePassword) {
            setUsernameErrorMessage('');
            setPassErrorMessage('Passwords do not match!');
        } else {
            setPassErrorMessage('');
            handleSignUp();
        }
    };

    const handleSignUp = async () => {
        if (username && password)
            try {
                const response = await fetch(
                    'http://localhost:5000/users/signup',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userName: username,
                            email: email,
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
                        <h3>Create Account</h3>
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
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-key"></i>
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="re-password"
                                    onChange={e => {
                                        setRePassword(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-user"></i>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="email (optional)"
                                    onChange={e => {
                                        setEmail(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="submit"
                                    value="Sign Up"
                                    className="btn float-right login_btn"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="card-footer">
                        <div className="d-flex justify-content-left links">
                            <a href="#">Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
