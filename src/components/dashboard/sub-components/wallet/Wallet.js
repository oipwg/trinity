import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Modal from '../../../helpers/modal';
import WalletBalanceBreakdown from './WalletBalanceBreakdown';
import RenderError from '../../../helpers/errors';
import Deposit from '../Deposit';
// import BuyCryptoModal from './BuyCryptoModal';
import Withdraw from '../Withdraw';
import Spinner from '../../../helpers/spinner';

import { connect } from 'react-redux';

import { coinbaseOAuth } from '../../../../actions/authActions'
import { loadWallet, getBalance } from '../../../../actions/walletActions';
import { getBittrexBalances } from '../../../../actions/bittrexActions'
import {
    listAccounts,
    listPaymentMethods,
} from '../../../../actions/coinbaseActions';

import { Link } from 'react-router-dom';
import { API_URL } from '../../../../../config';
import { tokenConfig } from '../../../../helpers-functions/headers';

const WalletBalance = props => {

    let coinbaseInDB;
    let coinbaseAccessToken

    //todo: handle refresh token, and create this into a pop-up
    // checks to see if coinbase obj is in user.
    if(props.user){
        coinbaseInDB = "coinbase" in props.user;

        if(coinbaseInDB){
            coinbaseAccessToken = props.user.coinbase.accessToken
        } else coinbaseAccessToken = undefined
    }

    //sends code to API. to get coinbase access token
    useEffect(() => {
        if(coinbaseInDB === false){
            const params = window.location.search;

            let code = params.replace(/(\?code=)/gi, '');

            if(code){
                props.coinbaseOAuth(code).then(res => {
                    location.reload();
                })
            }
        }

    }, [coinbaseInDB])



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

        if(props.user.bittrex){
            props.getBittrexBalances();
        }

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

    useEffect(() => {
        
        if(coinbaseAccessToken){
            props.listAccounts()
            props.listPaymentMethods();
        }
    }, [props.user])


    const usdSum = () => {

        let { balance, exchangeRate } = props.account;
        let { bittrexBalances } = props
        let sum = 0;

        if (balance && exchangeRate) {
            for (const k in balance) {
                if(typeof balance[k] === 'number'){
                    sum += exchangeRate[k] * balance[k];
                }
            }
        }


        if(bittrexBalances){
            for(const k in bittrexBalances){
                switch(bittrexBalances[k].Currency){
                    case 'BTC':
                         sum += bittrexBalances[k].Balance * exchangeRate.bitcoin
                    case 'FLO':
                        sum += bittrexBalances[k].Balance * exchangeRate.flo
                    case 'RVN':
                        sum += bittrexBalances[k].Balance * exchangeRate.raven
                }
            }
        }

        return Math.floor(sum * 100) / 100;
    };

    const renderBreakdown = () => {
        return (
            <li className="nav-item dropdown view-wallets" style={{ listStyle: 'none' }}>
                <a
                    onClick={handleCollapse}
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    View Wallets
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
                        bittrex={
                            props.bittrexBalances
                        }
                        mrr={124}
                        nicehash={213}
                    />
                )}
            </li>
        );
    };

    return (
        <div className="card wallet">
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
                    coinbaseInDB={coinbaseInDB}
                    exitModal={() => setDepositModal(false)}
                    handleClick={() => setDepositModal(!depositModal)} />
            )}  

            {/* change this  */}
            {withdrawModal && (
                <Withdraw
                    coinbaseInDB={coinbaseInDB}
                    exitModal={() => setWithdrawModal(false)}
                    handleClick={() => setWithdrawModal(!withdrawModal)}
                />
            )}
            <div className="card-header">Combine Wallet Balance</div>
            {/* Wallet Box */}
            <div
                className="wallet-body"
            >
            <div
                className="wallet-balance-box"
            >
                <div>
                    <h3>
                        ${''}
                        
                        {props.account.balance ? (
                            <>
                            {usdSum()}
                          <button 
                            style={{border: 'none', marginLeft: '8px', fontSize: '18px', backgroundColor: 'transparent'}}
                            onClick={() => {props.getBalance(props.account.wallet)
                                            props.getBittrexBalances() }
                                
                            }>
                            <i className="fas fa-redo"></i>
                            </button>  

                            </>
                        ) : (
                            <>

                            {/* Wallet Lock Button  */}
                                {
                                    showSpinner 
                                    ?
                                        <span style={{margin: '5px'}}>    
                                        <Spinner />
                                        </span>
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
                    <div style={{
                        margin: '5px',
                    }}>
                    <button
                        style={{width: '94.48px'}}
                        disabled={walletLock}
                        onClick={() => {
                            setDepositModal(!depositModal);
                        }}
                        type="button"
                        className="btn btn-primary"
                    >
                        Deposit
                    </button>
                    </div>
                    <div style={{
                        margin: '5px'
                    }}>
                
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
                </div>
            </div>
            {props.account.balance && renderBreakdown()}
            <div className="wallet-description">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Suspendisse dictum, dui sit amet rhoncus vehicula, felis leo suscipit turpis, in tempus enim neque eget eros.
            </p>
            </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        error: state.error,
        user: state.auth.user,
        account: state.account,
        bittrexBalances: state.bittrex.balances
    };
};

export default connect(mapStateToProps, {
    loadWallet,
    listAccounts,
    listPaymentMethods,
    getBalance,
    coinbaseOAuth,
    getBittrexBalances,
})(WalletBalance);
