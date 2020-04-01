import React from 'react';
import axios from 'axios';
import Modal from '../helpers/modal';
import { Link } from 'react-router-dom';
import { API_URL } from '../../../config';
import { tokenConfig } from '../../helpers/headers';
import { decrypt } from '../../helpers/crypto';
import logo from '../../../public/images/alexandria/alexandria-bookmark-100.png';
import RenderError from '../helpers/errors';
import MercMode from '../settings/prefrences/merc/MercMode';

// todo: If (no token is present) - Foward to Login - No Menu Options
// todo: CSS Navebar - Dashboard on the Left - Backup, User Right
// todo: Hambuger Menu - Collapse User when clicked?

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dropItDown: false,
            collapse: false,
            modalState: false,
            password: '',
            downloadmnemonic: false,
            error: null,
            showMnemonic: null,
            showSettingsMercModal: false
        };
    }

    container = React.createRef();

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleSave = () => {
        console.log('Saved!...')
        

        this.setState({
            showSettingsMercModal: !this.state.showSettingsMercModal
        });

    }

    handleClick = () => {
        this.setState({
            dropItDown: !this.state.dropItDown,
        });
    };

    handleClickOutside = event => {
        if (
            this.container.current &&
            !this.container.current.contains(event.target)
        ) {
            this.setState({
                dropItDown: false,
                collapse: false,
            });
        }
    };

    handleCollapse = e => {
        this.setState({
            collapse: !this.state.collapse,
        });
    };

    handleBackupModal = () => {
        this.setState({
            modalState: !this.state.modalState,
            showMnemonic: null,
            downloadmnemonic: false,
            password: '',
        });
    };
    handleSettingsMercModal = () => {
        this.setState({
            showSettingsMercModal: !this.state.showSettingsMercModal
        });
    };

    handleSubmit = e => {
        e.preventDefault();

        if (this.state.downloadmnemonic) {
            return;
        }

        let { _id } = this.props.user;
        let { password } = this.state;

        const body = JSON.stringify({
            id: _id,
            password,
        });

        axios
            .post(`${API_URL}/users/validatePassword`, body, tokenConfig())
            .then(res => res)
            .then(() => {
                this.setState({
                    downloadmnemonic: true,
                });

                let { mnemonic } = this.props.user;

                let plain = decrypt(mnemonic, password);

                this.setState({
                    showMnemonic: plain,
                });
            })
            .catch(err =>
                this.setState({
                    error: err.response.data,
                    downloadmnemonic: false,
                })
            );
    };

    dropDownMenu() {
        return (
            <div
                className="dropdown-menu show"
                aria-labelledby="navbarDropdown"
            >
                <Link
                    onClick={(this.handleClick, this.handleCollapse)}
                    className="dropdown-item"
                    to="setup"
                >
                    Setup
                </Link>
                <div
                    onClick={(this.handleClick, this.handleCollapse, this.handleSettingsMercModal)}
                    className="dropdown-item"
                >
                    Settings
                </div>
                <div className="dropdown-divider"></div>
                <Link
                    onClick={(this.handleClick, this.handleCollapse)}
                    className="dropdown-item"
                    to="/changePassword"
                >
                    Change Password
                </Link>
                <Link
                    onClick={(this.handleClick, this.handleCollapse)}
                    className="dropdown-item"
                    to="logout"
                >
                    Logout
                </Link>
            </div>
        );
    }

    render() {
        const { dropItDown, collapse } = this.state; //local state

        return (
            <nav
                id="header-navbar"
                className="navbar navbar-expand-lg navbar-light bg-primary"
                ref={this.container}
            >
                <Link
                    onClick={this.handleCollapse}
                    className="navbar-brand"
                    to="/"
                    style={{ color: '#fff' }}
                >
                    <img
                        src={logo}
                        alt="Alexandria Labs"
                        style={{ height: '45px' }}
                    />
                </Link>
                <button
                    onClick={this.handleCollapse}
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    style={{
                        marginRight: '20px',
                    }}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className={`collapse navbar-collapse ${
                        collapse ? 'show' : ''
                    }`}
                    id="navbarSupportedContent"
                >
                    <ul
                        className="navbar-nav"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '95%',
                        }}
                    >
                        {/* NAV LINkS */}
                        {this.props.user && (
                            <li className="nav-item">
                                <Link
                                    onClick={this.handleCollapse}
                                    className="nav-link"
                                    to="/dashboard"
                                >
                                    Dashboard
                                    <span className="sr-only">(current)</span>
                                </Link>
                            </li>
                        )}
                        {this.props.user ? null : (
                            <li>
                                <Link
                                    onClick={this.handleCollapse}
                                    className="nav-link"
                                    to="login"
                                >
                                    Login
                                </Link>
                            </li>
                        )}

                        {/* DROP DOWN */}
                        {this.props.user && (
                            <>
                                <li>
                                    <button
                                        onClick={this.handleBackupModal}
                                        style={{
                                            // moves the icon and messes up the click
                                            // position: 'relative',
                                            // left: '3rem',
                                            // top: '2.35rem',
                                            background: 'none',
                                            border: 'none',
                                            color: '#ffffff',
                                        }}
                                    >
                                        <i className="fas fa-cloud-download-alt"></i>
                                    </button>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        onClick={this.handleClick}
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                    >
                                        {this.props.user
                                            ? this.props.user.userName
                                            : 'user loading'}
                                    </a>
                                    {dropItDown && this.dropDownMenu()}
                                </li>
                            </>
                        )}
                    </ul>
                    {/* BACKUP WALLET MODAL */}
                    {this.state.modalState && (
                        <Modal
                            handleClick={this.handleBackupModal}
                            handleSubmit={this.handleSubmit}
                            title={'Backup Wallet'}
                            sendButtonTitle={<i className="fas fa-unlock"></i>}
                            submitType={'submit'}
                            modalBody={
                                <>
                                    <p>
                                        <strong style={{ color: 'red' }}>
                                            DO NOT LOSE THIS
                                        </strong>
                                        .
                                        <br />
                                        Burn it into your mind.
                                    </p>
                                    {this.state.showMnemonic ? (
                                        <div>
                                            <strong>
                                                {this.state.showMnemonic}
                                            </strong>
                                        </div>
                                    ) : (
                                        <form onSubmit={this.handleSubmit}>
                                            {/* <label>Enter Password</label> */}
                                            <input
                                                required
                                                type="password"
                                                className="form-control"
                                                placeholder="password"
                                                onChange={e => {
                                                    this.setState({
                                                        password:
                                                            e.target.value,
                                                        error: null,
                                                    });
                                                }}
                                            />
                                            {this.state.error && (
                                                <>
                                                    <br />
                                                    <RenderError
                                                        message={
                                                            this.state.error
                                                                .error
                                                        }
                                                    />
                                                </>
                                            )}
                                        </form>
                                    )}

                                    <br />
                                    <p>
                                        <strong>DO NOT</strong> forget it.
                                    </p>

                                    <p className="blockquote-footer">
                                        Hide your wife, hide your kids,
                                        definitely hide your mnemonic.
                                    </p>
                                </>
                            }
                        />
                    )}
                            {/* Settings */}
                {this.state.showSettingsMercModal && (
                        <Modal
                            handleClick={this.handleSettingsMercModal}
                            handleSubmit={this.handleSave}
                            // title={}
                            sendButtonTitle={<i className="fas fa-unlock"></i>}
                            submitType={'submit'}
                            modalBody={
                                <>
                                    <MercMode />
                                </>
                            }
                            footer={
                    <div className="deposit-footer">
                        <div className="deposit-footer-card">
                        </div>
                    </div>
                            }
                        submitType={'submit'}
                        sendButtonTitle={`Save`}
                        />
                    )}
                </div>
            </nav>
        );
    }
}

export default Navbar;
