import React, { useState, useEffect } from 'react';
import { encrypt } from '../../helpers/crypto';
import './signup.css';
import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types'; //todo: maybe ? del me
import { connect } from 'react-redux';
import { signup } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorAction';
import HDMW from '@oipwg/hdmw';
const Wallet = HDMW.Wallet;

const SignUp = props => {
    /**************************STATE SECTION************************/

    useEffect(() => {
        if (props.error.id === 'SIGNUP_FAIL') {
            return setUsernameErrorMessage(props.error.msg.error);
        }
    }, [props.error.id]);

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

    const [userHasMnemonic, setUserHasMnemonic] = useState('');
    const [disableMnemonic, setDisableMnemonic] = useState(true);

    // const [success, setSuccessMessage] = useState(null);

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
            getEncryptedMnemonic().then(async encrypted => {
                const newUser = {
                    userName: username,
                    email: email,
                    password: password,
                    mnemonic: encrypted,
                };
                // Attempt to Register
                try {
                    props.signup(newUser, props.history);
                } catch (error) {
                    console.log(error);
                }
            });
        }
    };

    const createMnemonic = async () => {
        if (userHasMnemonic) {
            let myWallet2 = new Wallet(userHasMnemonic, {
                supported_coins: ['flo'],
            });
            let validation = myWallet2.fromMnemonic(userHasMnemonic);

            if (validation) {
                return userHasMnemonic;
            }
        }

        let myWallet = new Wallet('', {
            supported_coins: ['flo'],
            discover: false,
        });

        let mnemonic = await myWallet.getMnemonic();
        console.log('My Mnemonic: ' + mnemonic);
        return mnemonic;
    };

    // todo: turn into syntx sugar async/await
    const getEncryptedMnemonic = () => {
        return createMnemonic()
            .then(mnemonic => {
                let encrypted = encrypt(mnemonic, password);

                return encrypted;
            })
            .then(encrypted => encrypted)
            .catch(err => console.log('WalletData ' + err));
    };

    return (
        <div
            id="signup-card"
            className="container d-flex justify-content-center align-items-center"
        >
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
                                        <i className="fas fa-users"></i>
                                    </span>
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    placeholder="username"
                                    onChange={e => {
                                        setUsername(e.target.value);
                                        setUsernameErrorMessage(null);
                                        props.clearErrors();
                                    }}
                                />
                            </div>
                            {/***** USERNAME ERROR  *****/}
                            {props.error.id && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {usernameErrorMessage}
                                </div>
                            )}

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
                                    required
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
                            {/* ENTER EXISTING MNEMONIC */}
                            <div className="input-group form-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-key"></i>
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="enter wallet (optional)"
                                    onChange={e => {
                                        setUserHasMnemonic(e.target.value);
                                    }}
                                />
                            </div>
                            {/* ENTER EXISTING MNEMONIC */}
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
                        <div className="d-flex justify-content-center links">
                            Have an account?
                            <Link
                                to="/login"
                                onClick={() => {
                                    props.clearErrors();
                                }}
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

//todo: maybe enforce prop types? maybe....
// SignUp.propTypes = {
//     isAuthneticated: PropTypes.bool,
//     error: PropTypes.object.isRequired,
//     signup: PropTypes.func.isRequired,
// };

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        error: state.error,
        user: state.user,
    };
};

export default connect(mapStateToProps, { signup, clearErrors })(SignUp);
