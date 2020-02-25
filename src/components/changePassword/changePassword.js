import React, { useState, useEffect } from 'react';
import { encrypt, decrypt } from '../../helpers/crypto';
import './changePassword.css';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { changePassword } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorAction';
import RenderSuccess from '../helpers/sucess';
import RenderError from '../helpers/errors';

// todo: add Token to local storage
// todo: HDMW decrypt HDMW wallet???

const ResetPassword = props => {
    /**************************STATE SECTION************************/

    //**Password States */
    const [oldPassword, setOldPassword] = useState(null);

    const [password, setPassword] = useState(null);
    const [rePassword, setRePassword] = useState(null);
    const [passErrorMessage, setPassErrorMessage] = useState(null);

    const onFormSubmit = e => {
        e.preventDefault();
        validateForm(e);
    };

    /****** Function to compare password, usename, fields */

    const validateForm = e => {
        if (!oldPassword) {
            setOldPassword('Enter password');
        } else if (!password) {
            setOldPassword('');
            setPassErrorMessage('Enter password');
        } else if (password !== rePassword) {
            setPassErrorMessage('Passwords do not match!');
        } else {
            setPassErrorMessage('');

            let menemonicPlainText = decrypt(props.user.mnemonic, oldPassword);
            let encrypted = encrypt(menemonicPlainText, password);

            if (!menemonicPlainText) {
                setPassErrorMessage('Invalid Credentials');
                return console.error('Failed to get mnemonic', {
                    menemonicPlainText,
                });
            }

            const updatedPass = {
                id: props.user._id,
                oldPassword,
                password,
                mnemonic: encrypted,
            };

            try {
                props.changePassword(updatedPass);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const renderForm = () => {
        return (
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
                            setOldPassword(e.target.value);
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
                {passErrorMessage && <RenderError message={passErrorMessage} />}
                <div className="form-group">
                    <input
                        type="submit"
                        value="Send"
                        className="btn float-right login_btn"
                    />
                </div>
            </form>
        );
    };

    return (
        <div
            id="changePass-card"
            className="container d-flex justify-content-center align-items-center"
        >
            <div className="">
                <div className="card">
                    <div className="card-header">
                        <h3>Change Password</h3>
                    </div>
                    <div className="card-body">
                        {props.success.status === 200 ? (
                            <RenderSuccess
                                message={props.success.msg.success}
                            />
                        ) : (
                            renderForm()
                        )}
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

const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        error: state.error,
        user: state.auth.user,
        success: state.success,
    };
};

export default connect(mapStateToProps, { changePassword, clearErrors })(
    ResetPassword
);
