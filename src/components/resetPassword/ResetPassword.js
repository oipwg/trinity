import React, { useState, useEffect } from 'react';
import wallet from '../../helpers/Wallet';
import { encrypt } from '../../helpers/crypto';
import './resetPassword.css';
import { Link } from 'react-router-dom';
const { createMnemonic } = wallet;

// todo: add Token to local storage
// todo: HDMW decrypt HDMW wallet???

const ResetPassword = props => {
    /**************************STATE SECTION************************/
    //**Display Name States */
    const [username, setUsername] = useState(null);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState(null);

    //**Password States */
    const [password, setPassword] = useState(null);
    const [rePassword, setRePassword] = useState(null);
    const [passErrorMessage, setPassErrorMessage] = useState(null);

    //**Email States */
    const [email, setEmail] = useState('');

    const [success, setSuccessMessage] = useState(null);

    //todo: del me? stick mnemonic in global state
    const [walletRecord, setWalletRecord] = useState({
        mnemonic: '',
        encryption: '',
    });

    const onFormSubmit = e => {
        e.preventDefault();
        validateForm(e);
    };

    /****** Function to compare password, usename, fields */

    const validateForm = e => {
        if (!username) {
            setUsernameErrorMessage('Enter username');
        } else if (!password) {
            setUsernameErrorMessage('');
            setPassErrorMessage('Enter password');
        } else if (password !== rePassword) {
            setUsernameErrorMessage('');
            setPassErrorMessage('Passwords do not match!');
        } else {
            setPassErrorMessage('');
            getMnemonic().then(async encrypted => {
                handleSignUp(encrypted);
            });
        }
    };

    // todo: turn into syntx sugar async/await
    const getMnemonic = () => {
        return createMnemonic()
            .then(mnemonic => {
                let encrypted = encrypt(mnemonic, password);

                return encrypted;
            })
            .then(encrypted => encrypted)
            .catch(err => console.log('WalletData ' + err));
    };

    const handleSignUp = async encrypted => {
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
                            mnemonic: encrypted,
                        }),
                    }
                );
                const data = await response.json();

                if (data.error) {
                    setUsernameErrorMessage(data.error);
                } else if (data.token) {
                    setSuccessMessage(data.token);
                    props.history.push('/setup');
                }

                localStorage.setItem('token', data.token);
            } catch (error) {
                console.error(error);
            }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center">
            <div className="">
                <div className="card">
                    <div className="card-header">
                        <h3>Reset Password</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={onFormSubmit} value="submit">
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-key"></i>
                                    </span>
                                </div>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="old-password"
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        setPassErrorMessage(null);
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
                                        setPassErrorMessage(null);
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
                                        setPassErrorMessage(null);
                                    }}
                                />
                            </div>
                            {/***** PASS ERROR  *****/}
                            {passErrorMessage && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {passErrorMessage}
                                </div>
                            )}

                            {/***** SUCCESS!  *****/}
                            {success && (
                                <div
                                    className="alert alert-success"
                                    role="alert"
                                >
                                    {'Success! '}
                                    <span role="img" aria-label="thumbs-uo">
                                        👍
                                    </span>
                                </div>
                            )}
                            <div className="form-group">
                                <input
                                    type="submit"
                                    value="Sign Up"
                                    className="btn float-right login_btn"
                                />
                            </div>
                        </form>
                        <div className="card-footer">
                            <div className="d-flex justify-content-left links">
                                <Link to="/setup">Setup</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
