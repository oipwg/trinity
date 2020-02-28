import React from 'react';
import logo from '../../../public/images/alexandria/alexandria-bookmark-100.png';

import { Link } from 'react-router-dom';

// todo: If (no token is present) - Foward to Login - No Menu Options

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dropItDown: false,
            collapse: false,
        };
    }

    container = React.createRef();

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
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
                                        : '...'}
                                </a>
                                {dropItDown && this.dropDownMenu()}
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        );
    }
}

export default Navbar;
