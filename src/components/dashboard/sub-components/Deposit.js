import React, { useState, useEffect } from 'react';
import Modal from '../../helpers/modal';
import btcLogo from '../../../../public/images/icons/btc.svg';
import rvnLogo from '../../../../public/images/icons/rvn.svg';
import floLogo from '../../../../public/images/icons/flo.svg';
import coinbaseLogo from '../../../../public/images/icons/coinbase.png';



import './subcomponent.css';

import Confirm from './Confirm';
import BuyOrSellOptions from './BuyOrSellOptions';
import PayOrWithdrawOptions from './PayOrWithdrawOptions';

import { connect } from 'react-redux';
import {
    placeBuyOrderWithoutFees,
    placeBuyOrderWithFees,
} from '../home/coinbaseApi';

//todo: show coinbase account balance and or limit?
//todo: add icons for Buy: Currencies && Pay W: Options
//todo: connect confirm button to acutally send transatcion: quote = false.
//todo: add checkbox, that will switch functions from placeBuyOrderWithoutFees, to placeBuyOrderWithFees will accounts for fees.
//todo: add button that will switch buyCurrency to allow user to buy in Crypto amount, currently defaulted to USD dollar worth.
//! todo: add error messages!
//todo: create a transacation ID to avoid dupes
//todo: Coinbase will send BTC from coinbase wallet directly to MRR Wallet || Nice Hash Wallet || Trinity Wallet
// todo: RVN/FLO No coinbse option

const Deposit = props => {

    let crypto = {
        bitcoin: {
            code: "BTC",
            icon: btcLogo
        },
        flo: {
            code: "FLO",
            icon: floLogo
        }, 
        raven: {
            code: "RVN",
            icon: rvnLogo
        },
    }


    let accounts = props.accounts ? props.accounts.data : null;
    let paymentMethods = props.paymentMethods
        ? props.paymentMethods.data
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
    const [showDepositCrypto, setShowDepositCrypto] = useState({
        visible: false,
        crypto: null
    });

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

    const handleSubmit = e => {
        e.preventDefault();

        placeBuyOrderWithoutFees(
            coinbaseBuyOption.id,
            buyAmount,
            buyCurrency
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
                title={'Deposit'}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    Object.keys(crypto).map((coin, i) => {
                        return (
                            <div
                            onClick={() => {
                                setShowDepositCrypto(
                                    {
                                        visible: !showDepositCrypto.visible,
                                        crypto: crypto[coin].code
                                    }
                                )
                            }}
                            style={{
                                cursor: 'pointer',
                                display: 'flex', justifyContent: 'space-evenly', padding: '10px', alignItems: 'flex-start'}}
                            key={i}>
                                <img src={crypto[coin].icon}></img>
                                <div>

                                <p>{crypto[coin].code}</p>
                                </div>
                                <i className="fas fa-chevron-right"></i>

                            </div>
                        )
                    })

                }
            />
        );
    };

    // const renderComponents = () => {
    


    //     if (showConfirmBuy) {
    //         return (
    //             <Confirm
    //                 payWith={primaryAcc.name}
    //                 confirmOrder={confirmOrder}
    //                 handleClick={() => setShowConfirmBuy(!showConfirmBuy)}
    //                 title={'Confirm order'}
    //                 headingOne={'Pay with'}
    //                 headingTwo={'Price'}
    //                 headingThree={'Purchase'}
    //                 headingFour={'Coinbase fee'}
    //                 headingFive={'Amount'}
    //                 headingSix={'Total'}
    //             />
    //         );
    //     } else if (showBuyOptions) {
    //         return (
    //             <BuyOrSellOptions
    //                 handleReturnObj={handleReturnObj}
    //                 handleClick={() => setShowBuyOptions(!showBuyOptions)}
    //                 crypto={accounts}
    //                 title={'Buy'}
    //             />
    //         );
    //     } else if (showPayOptions) {
    //         return (
    //             <PayOrWithdrawOptions
    //                 handleReturnObj={handleReturnObj}
    //                 handleClick={() => setShowPayOptions(!showPayOptions)}
    //                 paymentMethods={paymentMethods}
    //                 title={'Pay With'}
    //             />
    //         );
    //     } else {
    //         return <DepositModal />;
    //     }
    // };

    const renderComponents = () => {
    


        if (showDepositCrypto.visible) {
            return (
                <Modal
                handleClick={() => {setShowDepositCrypto({
                        visible: !showDepositCrypto.visible,
                })}}
                handleSubmit={e => handleSubmit(e)}
                title={`Deposit ${showDepositCrypto.crypto}`}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    <div>
                      <div style={{
                          display: 'flex',


                      }}>

                      <span style={{ flex: '1 1 auto'}}>

                      <i  
                        style={{fontSize: '32px'}}
                      className="fas fa-qrcode"></i>
                      </span>
                        <div style={{ flex: '1 1 auto'}}>
                        <p>
                        <strong>Crypto Address</strong>
                        </p>
                        <p>network transfer</p>
                        </div>
                        <i className="fas fa-chevron-right"></i>
                      </div>

                        
                        

                        <div
                        style={{
                          display: 'flex',


                      }}
                        >

                        <span style={{ flex: '1 1 auto'}}>
                        <img width='32px' height='32px' style={{borderRadius: '25%'}} src={coinbaseLogo}></img>
                        </span>
                    <div style={{ flex: '1 1 auto'}}>
                        <p>
                        <strong>Coinbase</strong>
                        <p>Trasnfer funds from Coinbase.com</p>
                        </p>
                       </div>
                        <i className="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    

                }
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

export default connect(mapStateToProps, {})(Deposit);
