import React, { useState, useEffect } from 'react';
import btcLogo from '../../../../public/images/icons/btc.svg';
import { API_URL } from '../../../../config';
import './subcomponent.css';

import Modal from '../../helpers/modal';
import Confirm from './Confirm';
import BuyOrSellOptions from './BuyOrSellOptions';
import PayOrWithdrawOptions from './PayOrWithdrawOptions';



import { connect } from 'react-redux';

import { placeSellOrderWithoutFees } from '../../../actions/coinbaseActions';

const SellCryptoModal = props => {

    let accounts = props.accounts ? props.accounts.data : null;
    let paymentMethods = props.paymentMethods ? props.paymentMethods.data
        : null;

    const [buyAmount, setBuyAmount] = useState('');
    const [buyCurrency, setBuyCurrency] = useState('USD');
    const [primaryAcc, setPrimaryAcc] = useState({
        id: '',
        name: '',
        type: '',
    });

    const [coinbaseBuyOption, setCoinbaseBuyOption] = useState({
        id: '',
        name: '',
        type: '',
        currency: '',
        code: '',
    });

    const [confirmOrder, setConfirmOrder] = useState({
        fee: '',
        amount: '',
        total: '',
        subtotal: '',
        unit_price: '',
        status: '',
    });
    
    const [showConfirmBuy, setShowConfirmBuy] = useState(false);
    const [showBuyOptions, setShowBuyOptions] = useState(false);
    const [showPayOptions, setShowPayOptions] = useState(false);

    useEffect(() => {
        {
            if (accounts && paymentMethods) {
                paymentMethods.find(obj => {
                    if (obj.primary_buy === true) {
                        setPrimaryAcc({
                            id: obj.id,
                            name: obj.name,
                            type: obj.type,
                        });
                    } else return;
                });

                accounts.find(obj => {
                    if (obj.currency.code === 'BTC') {
                        setCoinbaseBuyOption({
                            id: obj.id,
                            name: obj.name,
                            type: obj.type,
                            currency: obj.currency.name,
                            code: obj.currency.code,
                        });
                    }
                });
            }
        }
    }, []);

    // returns qoute
    const handleSubmit = e => {
        e.preventDefault();

        props.placeSellOrderWithoutFees(
            coinbaseBuyOption.id,
            buyAmount,
            buyCurrency,
            primaryAcc.id,
            false,
            true
        ).then(res => {
            let {
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            } = res.data.data;

            setConfirmOrder({
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            });

            setShowConfirmBuy(!showConfirmBuy);
        });
    };

    const submitWithdraw = e => {
        e.preventDefault();

        props.placeSellOrderWithoutFees(
            coinbaseBuyOption.id,
            buyAmount,
            buyCurrency,
            primaryAcc.id,
            false,
            true //! false would result it withdraw
        ).then(res => {
            let {
                fee,
                amount,
                total,
                subtotal,
                unit_price,
                status,
            } = res.data.data;

            console.log(res)

            props.exitModal();

        });
    };

    

    const handleReturnObj = (from, option) => {
        switch (from) {
            case 'buy':
                return setCoinbaseBuyOption({
                    id: option.id,
                    name: option.name,
                    type: option.type,
                    currency: option.currency.name,
                    code: option.currency.code,
                });
            case 'pay':
                return setPrimaryAcc({
                    id: option.id,
                    name: option.name,
                    type: option.type,
                });
            default:
                return;
        }
    };

    const DepositModal = () => {
        return (
            <Modal
                handleClick={props.handleClick}
                handleSubmit={e => handleSubmit(e)}
                title={props.title}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    <div className="deposit-input">
                        <span className="deposit-dollarsign">$</span>
                        <input
                            autoFocus={true}
                            onChange={e => {
                                let amount = e.target.value;

                                amount.match(/^[0-9]*$/)
                                    ? setBuyAmount(amount)
                                    : null;
                            }}
                            minLength="1"
                            type="tel"
                            placeholder="0"
                            fontSize="62"
                            value={buyAmount}
                            className="deposit-modal"
                        />
                    </div>
                }
                footer={
                    <div className="deposit-footer">
                        <div className="deposit-footer-card">
                            <div className="deposit-footer-items">
                                <div>
                                    <p>Sell</p>
                                </div>
                                <div>
                                    <img
                                        src={btcLogo}
                                        alt="Bitcoin Logo"
                                        width="30px"
                                    />{' '}
                                    {coinbaseBuyOption.currency}
                                </div>
                                <button
                                    onClick={() =>
                                        setShowBuyOptions(!showBuyOptions)
                                    }
                                    style={{ border: 'none', outline: 'none' }}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div className="deposit-footer-items">
                                <div>
                                    <p>Withdraw to</p>
                                </div>
                                <div>
                                    <img
                                        src={btcLogo}
                                        alt="Bitcoin Logo"
                                        width="30px"
                                    />{' '}
                                    {primaryAcc.name}
                                </div>
                                <button
                                    onClick={() =>
                                        setShowPayOptions(!showPayOptions)
                                    }
                                    style={{ border: 'none', outline: 'none' }}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                }
                submitType={'submit'}
                sendButtonTitle={`${props.submitTitle} ${coinbaseBuyOption.currency}`}
            />
        );
    };

    const renderComponents = () => {
        if (showConfirmBuy) {
            return (
                <Confirm
                    payWith={primaryAcc.name}
                    confirmOrder={confirmOrder}
                    handleClick={() => setShowConfirmBuy(!showConfirmBuy)}
                    handleSubmit={(e) => {
                        submitWithdraw(e)
                    }}
                    title={'Confirm order'}
                    headingOne={'Pay to'}
                    headingTwo={'Sold at'}
                    headingThree={'Deposit'}
                    headingFour={'Coinbase fee'}
                    headingFive={'Amount'}
                    headingSix={'Total'}
                />
            );
        } else if (showBuyOptions) {
            return (
                <BuyOrSellOptions
                    handleReturnObj={handleReturnObj}
                    handleClick={() => setShowBuyOptions(!showBuyOptions)}
                    crypto={accounts}
                    title={'Buy'}
                />
            );
        } else if (showPayOptions) {
            return (
                <PayOrWithdrawOptions
                    handleReturnObj={handleReturnObj}
                    handleClick={() => setShowPayOptions(!showPayOptions)}
                    paymentMethods={paymentMethods}
                    title={'Pay With'}
                />
            );
        } else {
            return <DepositModal />;
        }
    };

    return renderComponents();
};

const mapStateToProps = state => {
    return {
        error: state.error,
        accounts: state.coinbase.accounts,
        paymentMethods: state.coinbase.paymentMethods,
    };
};

export default connect(mapStateToProps, {placeSellOrderWithoutFees})(SellCryptoModal);
