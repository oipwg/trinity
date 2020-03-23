import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Modal from '../../helpers/modal';
import WalletBalanceBreakdown from './WalletBalanceBreakdown';
import RenderError from '../../helpers/errors';
import Deposit from './Deposit';
// import BuyCryptoModal from './BuyCryptoModal';
import Withdraw from './Withdraw';
import Spinner from '../../helpers/spinner';

import { connect } from 'react-redux';
import { loadWallet, getBalance } from '../../../actions/walletActions';
import {
    listAccounts,
    listPaymentMethods,
} from '../../../actions/coinbaseActions';

import { Link } from 'react-router-dom';
import { API_URL } from '../../../../config';
import { tokenConfig } from '../../../helpers/headers';

const WalletBalance = props => {
    const [modalState, setModalState] = useState(false);
    const [password, setPassword] = useState('');
    // const [myWallet, setMyWallet] = useState(null);
    // const [walletBalance, setWalletBalance] = useState(null);
    // const [exchangeRate, setExchangeRate] = useState(null);
    const [dropdownState, setDropdown] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [depositModal, setDepositModal] = useState(false);
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false)
    const [walletLock, setWalletLock] = useState(true); 

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

        setShowSpinner(!showSpinner);
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
                setShowSpinner(!showSpinner);
                setWalletLock(false)
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
                console.log(balance[k]);

                if(typeof balance[k] === 'number'){
                    sum += exchangeRate[k] * balance[k];
                }
                
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
                            typeof props.account.balance.flo === 'number'
                                ? props.account.balance.flo.toFixed(8)
                                : 'n/a'
                        }
                        localBtc={
                            typeof props.account.balance.bitcoin === 'number'
                                ? props.account.balance.bitcoin.toFixed(8)
                                : 'n/a'
                        }
                        localRvn={
                            typeof props.account.balance.raven === 'number'
                                ? props.account.balance.raven.toFixed(8)
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

            <a href={`${API_URL}/auth/coinbase`}>
            Coinbase
            </a>


            <button
                onClick={() => {
                    props.listAccounts();
                    props.listPaymentMethods();
                }}
            >
                useEffect
            </button>
            {modalState && (
                <Modal
                    handleClick={handleClick}
                    handleSubmit={handleSubmit}
                    title={'Unencrypt Wallet'}
                    headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff', }}
                    sendButtonTitle={<i className="fas fa-unlock"></i>}
                    submitType={'submit'}
                    modalBody={
                        <form onSubmit={handleSubmit}>
                            <label>Enter Password</label>
                            <input
                                autoFocus
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
                <Deposit 
                    exitModal={() => setDepositModal(false)}
                    handleClick={() => setDepositModal(!depositModal)} />
            )}  

            {/* change this  */}
            {withdrawModal && (
                <Withdraw
                    exitModal={() => setWithdrawModal(false)}
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
                            <>
                            {usdSum()}
                          <button 
                            style={{border: 'none', marginLeft: '10px', fontSize: '18px'}}
                            onClick={() => props.getBalance(props.account.wallet)}>
                            <i className="fas fa-redo"></i>
                            </button>  

                            </>
                        ) : (
                            <>

                            {/* Wallet Lock Button  */}
                                {
                                    showSpinner 
                                    ?
                                        <Spinner />
                                    :
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleClick}
                                            style={{
                                                marginLeft: '.4rem',
                                                marginRight: '.4rem',
                                            }}>
                                            <i className="fas fa-lock"></i>
                                        </button>
                                }
                            </>
                        )}
                    </h3>
                </div>

                {/* Deposit/Withdraw Buttons */}
                <div>
                    <button
                        disabled={walletLock}
                        style={{marginRight: '.25rem'}}
                        onClick={() => {
                            setDepositModal(!depositModal);
                        }}
                        type="button"
                        className="btn btn-primary"
                    >
                        Deposit
                    </button>
                    <button
                        disabled={walletLock}
                        onClick={() => {
                            setWithdrawModal(!withdrawModal);
                        }}
                        type="button"
                        className="btn btn-secondary"
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
    getBalance, 
})(WalletBalance);
