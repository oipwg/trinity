import React, { useState } from 'react';

import { Link } from 'react-router-dom';

class Navbar extends React.Component {
    container = React.createRef();
    state = {
        dropItDown: false,
        collapse: false,
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClick = () => {
        this.setState({
            dropItDown: true,
        });
    };

    handleClickOutside = event => {
        if (
            this.container.current &&
            !this.container.current.contains(event.target)
        ) {
            this.setState({
                dropItDown: false,
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
                <Link className="dropdown-item" to="setup">
                    Setup
                </Link>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item" to="/changePassword">
                    Change Password
                </Link>
                <Link className="dropdown-item" to="logout">
                    Logout
                </Link>
            </div>
        );
    }

    render() {
        const { dropItDown, collapse } = this.state;
        return (
            <nav
                className="navbar navbar-expand-lg navbar-light bg-light"
                ref={this.container}
            >
                <Link className="navbar-brand" to="/">
                    TRINITY
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
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className={`collapse navbar-collapse ${
                        collapse ? 'show' : ''
                    }`}
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav mr-auto">
                        {/* NAV LINkS */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home <span className="sr-only">(current)</span>
                            </Link>
                        </li>
                        <li>
                            <Link className="nav-link" to="login">
                                Login
                            </Link>
                        </li>

                        {/* DROP DOWN */}
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
                                Settings
                            </a>
                            {dropItDown && this.dropDownMenu()}
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default Navbar;
