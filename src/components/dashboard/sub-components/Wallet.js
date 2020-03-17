import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../helpers/modal';
import WalletBalanceBreakdown from './WalletBalanceBreakdown';
import RenderError from '../../helpers/errors';
import Deposit from './Deposit';
// import BuyCryptoModal from './BuyCryptoModal';

import { connect } from 'react-redux';
import { loadWallet } from '../../../actions/walletActions';
import {
    listAccounts,
    listPaymentMethods,
} from '../../../actions/coinbaseActions';

import { Link } from 'react-router-dom';
import { API_URL } from '../../../../config';
import { tokenConfig } from '../../../helpers/headers';
import Withdraw from './Withdraw';

const WalletBalance = props => {
    const [modalState, setModalState] = useState(false);
    const [password, setPassword] = useState('');
    // const [myWallet, setMyWallet] = useState(null);
    // const [walletBalance, setWalletBalance] = useState(null);
    // const [exchangeRate, setExchangeRate] = useState(null);
    const [dropdownState, setDropdown] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [depositModal, setDepositModal] = useState(true); //! false
    const [withdrawModal, setWithdrawModal] = useState(false);

    const handleClick = () => {
        return setModalState(!modalState);
    };

    const handleCollapse = e => {
        return setDropdown(!dropdownState);
    };

    const handleSubmit = e => {
        e.preventDefault();

        if (password == '') {
            return setErrorMessage({ error: 'Enter Password ' });
        }

        let { mnemonic, _id } = props.user;

        const body = JSON.stringify({
            id: _id,
            password,
        });

        axios
            .post(`${API_URL}/users/validatePassword`, body, tokenConfig())
            .then(res => res)
            .then(() => {
                props.loadWallet(mnemonic, password);
                setModalState(false);
            })
            .catch(err => setErrorMessage(err.response.data));
    };

    useEffect(() => {
        if (props.account.walletLoaded) {
            setModalState(false);
        }
    }, [props.account]);

    const usdSum = () => {
        let { balance, exchangeRate } = props.account;
        let sum = 0;

        if (balance && exchangeRate) {
            for (const k in balance) {
                sum += exchangeRate[k] * balance[k];
            }
        }
        return Math.floor(sum * 100) / 100;
    };

    const renderBreakdown = () => {
        return (
            <li className="nav-item dropdown" style={{ listStyle: 'none' }}>
                <a
                    onClick={handleCollapse}
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    Available for immediate renting
                </a>
                {dropdownState && (
                    <WalletBalanceBreakdown
                        localFlo={
                            props.account.balance
                                ? props.account.balance.flo
                                : 'n/a'
                        }
                        localBtc={
                            props.account.balance
                                ? props.account.balance.bitcoin
                                : 'n/a'
                        }
                        mrr={124}
                        nicehash={213}
                    />
                )}
            </li>
        );
    };

    return (
        <div className="card">
            <button
                onClick={() => {
                    props.listAccounts();
                    props.listPaymentMethods();
                }}
            >
                Test
            </button>
            {modalState && (
                <Modal
                    handleClick={handleClick}
                    handleSubmit={handleSubmit}
                    title={'Unencrypt Wallet'}
                    sendButtonTitle={<i className="fas fa-unlock"></i>}
                    submitType={'submit'}
                    modalBody={
                        <form onSubmit={handleSubmit}>
                            <label>Enter Password</label>
                            <input
                                required
                                type="password"
                                className="form-control"
                                placeholder="password"
                                onChange={e => {
                                    setPassword(e.target.value);
                                    setErrorMessage(null);
                                }}
                            />
                            <br />
                            {errorMessage && (
                                <RenderError message={errorMessage.error} />
                            )}
                        </form>
                    }
                />
            )}
            {depositModal && (
                <Deposit handleClick={() => setDepositModal(!depositModal)} />
            )}

            {/* change this  */}
            {withdrawModal && (
                <Withdraw
                    handleClick={() => setWithdrawModal(!withdrawModal)}
                />
            )}

            <div className="card-header">Wallet</div>
            <div
                className="card-body"
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <div>
                    <h3>
                        ${''}
                        {props.account.balance ? (
                            usdSum()
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClick}
                                style={{
                                    marginLeft: '.4rem',
                                    marginRight: '.4rem',
                                }}
                            >
                                <i className="fas fa-lock"></i>
                            </button>
                        )}
                    </h3>
                </div>
                <div>
                    <button
                        onClick={() => {
                            setDepositModal(!depositModal);
                        }}
                        type="button"
                        className="btn btn-primary"
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => {
                            setWithdrawModal(!withdrawModal);
                        }}
                        type="button"
                        className="btn btn-light"
                    >
                        Withdraw
                    </button>
                </div>
                {props.account.balance && renderBreakdown()}
            </div>
            <Link to="#">View Transactions</Link>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        error: state.error,
        user: state.auth.user,
        account: state.account,
    };
};

export default connect(mapStateToProps, {
    loadWallet,
    listAccounts,
    listPaymentMethods,
})(WalletBalance);
