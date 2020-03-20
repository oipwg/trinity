import React, { useState, useEffect } from 'react';
import Modal from '../../helpers/modal';
import coinbaseLogo from '../../../../public/images/icons/coinbase.png';
import { crypto } from './crypto';

import './subcomponent.css';

import DepositWithdrawOptions from './DepositWithdrawOptions'
import Confirm from './Confirm';
import BuyOrSellOptions from './BuyOrSellOptions';
import PayOrWithdrawOptions from './PayOrWithdrawOptions';
import BuyCryptoModal from './BuyCryptoModal';
import SellCryptoModal from './SellCryptoModal';
import NetworkTransferSend from './NetworkTransferSend';


import { placeBuyOrderWithoutFees } from '../../../actions/coinbaseActions';

import { connect } from 'react-redux';


const Withdraw = props => {
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

    const [showConfirmSell, setShowConfirmSell] = useState(false);


    // 
    const [showNetworkTransfer, setShowNetworkTransfer] = useState(false);
    const [showBuySellModal, setShowBuySellModal] = useState(false);
    const [showDepositCrypto, setShowDepositCrypto] = useState({
        visible: false,
        crypto: '',
        name: ''
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
                    } else return;
                });
            }
        }
    }, []);

    const handleSubmit = e => {
        e.preventDefault();

        console.log('ran')

        props.placeSellOrderWithoutFees(
            coinbaseBuyOption.id,
            buyAmount,
            buyCurrency
        ).then(res => {
            console.log(res);

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

            setShowConfirmSell(!showConfirmSell);
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

    const WithdrawModal = () => {
        return (
            <Modal
                handleClick={props.handleClick}
                handleSubmit={e => handleSubmit(e)}
                title={'Withdraw'}
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
                                        code: crypto[coin].code,
                                        name: crypto[coin].name,
                                        icon: crypto[coin].icon
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


    const CoinbaseLogo = () =>{ return <img width='32px' height='32px' style={{borderRadius: '25%'}} src={coinbaseLogo}></img>}


    const renderComponents = () => {
    

        if (showDepositCrypto.visible) {
           return <DepositWithdrawOptions 
            handleClick={() => {setShowDepositCrypto({
                visible: !showDepositCrypto.visible,
                        })}}
            title={`Withdraw ${showDepositCrypto.code}`}
            coinbaseLogo={<CoinbaseLogo />}
            handleCoinbaseClick={() => {
                setShowBuySellModal(!showBuySellModal)
                setShowDepositCrypto({
                ...showDepositCrypto,
                visible: !showDepositCrypto.visible,
                        })        
            }}
            handleCryptoAddressClick={() => {
                setShowNetworkTransfer(!showNetworkTransfer)
                setShowDepositCrypto({
                ...showDepositCrypto,
                visible: !showDepositCrypto.visible,
                        })
            }
            }

           />
        } else if(showBuySellModal) {
            return (
                 <SellCryptoModal 
                 title={"Sell"}
                 submitTitle={"Sell"}
                handleClick={() => {
                setShowBuySellModal(!showBuySellModal)
                setShowDepositCrypto({
                ...showDepositCrypto,
                visible: !showDepositCrypto.visible,
                        })  
            }}
                crypto={showDepositCrypto.crypto}          
             />
                )
        } else if(showNetworkTransfer) {
            return (
                <NetworkTransferSend
                 exitModal={props.exitModal}
                 handleClick={() => {
                setShowNetworkTransfer(!showNetworkTransfer)
                setShowDepositCrypto({
                ...showDepositCrypto,
                visible: !showDepositCrypto.visible,
                        })  
                }}
                showDepositCrypto={showDepositCrypto}          
             />
            )
        }
        
        
        
        else {
            return <WithdrawModal />;
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

export default connect(mapStateToProps, {placeBuyOrderWithoutFees})(Withdraw);
