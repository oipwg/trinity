import React, { useState } from 'react';
import Modal from '../../helpers/modal';
import coinbaseLogo from '../../../../public/images/icons/coinbase.png';
import { crypto } from './crypto';

import './subcomponent.css';

import DepositWithdrawOptions from './DepositWithdrawOptions'
import SellCryptoModal from './SellCryptoModal';
import NetworkTransferSend from './NetworkTransferSend';


import { placeBuyOrderWithoutFees } from '../../../actions/coinbaseActions';

import { connect } from 'react-redux';


const Withdraw = props => {
    const [showNetworkTransfer, setShowNetworkTransfer] = useState(false);
    const [showBuySellModal, setShowBuySellModal] = useState(false);
    const [showWithdrawCrypto, setShowWithdrawCrypto] = useState({
        visible: false,
        crypto: '',
        name: ''
    });


    const WithdrawModal = () => {
        return (
            <Modal
                handleClick={props.handleClick}
                title={`Withdraw`}
                code={showWithdrawCrypto.code}

                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    Object.keys(crypto).map((coin, i) => {
                        return (
                            <div
                            onClick={() => {
                                setShowWithdrawCrypto(
                                    {
                                        visible: !showWithdrawCrypto.visible,
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

    const CoinbaseLogo = () =>{ return <img width='32px' height='32px' style={{borderRadius: '25%'}} src={coinbaseLogo}></img>}


    const renderComponents = () => {
        if (showWithdrawCrypto.visible) {
           return <DepositWithdrawOptions 
            handleClick={() => {setShowWithdrawCrypto({
                visible: !showWithdrawCrypto.visible,
                        })}}
            title={`Withdraw ${showWithdrawCrypto.code}`}
            code={showWithdrawCrypto.code}
            coinbaseLogo={<CoinbaseLogo />}
            handleCoinbaseClick={() => {
                setShowBuySellModal(!showBuySellModal)
                setShowWithdrawCrypto({
                ...showWithdrawCrypto,
                visible: !showWithdrawCrypto.visible,
                        })        
            }}
            handleCryptoAddressClick={() => {
                setShowNetworkTransfer(!showNetworkTransfer)
                setShowWithdrawCrypto({
                ...showWithdrawCrypto,
                visible: !showWithdrawCrypto.visible,
                        })
            }
            }

           />
        } else if(showBuySellModal) {
            return (
                 <SellCryptoModal 
                exitModal={props.exitModal}
                 title={"Sell"}
                 submitTitle={"Sell"}
                handleClick={() => {
                setShowBuySellModal(!showBuySellModal)
                setShowWithdrawCrypto({
                ...showWithdrawCrypto,
                visible: !showWithdrawCrypto.visible,
                        })  
            }}
                crypto={showWithdrawCrypto.crypto}          
             />
                )
        } else if(showNetworkTransfer) {
            return (
                <NetworkTransferSend
                 exitModal={props.exitModal}
                 handleClick={() => {
                setShowNetworkTransfer(!showNetworkTransfer)
                setShowWithdrawCrypto({
                ...showWithdrawCrypto,
                visible: !showWithdrawCrypto.visible,
                        })  
                }}
                showWithdrawCrypto={showWithdrawCrypto}          
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
