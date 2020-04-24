import React, { useState } from 'react';
import QRCode from 'qrcode.react'
import './subcomponent.css';

import Modal from '../../helpers/modal';

import { connect } from 'react-redux';


const NetworkTransfer = props => {

    let { name, code, icon } = props.showDepositCrypto 

    let addresses = props.wallet ? Object.keys(props.wallet.coins[name].accounts[0].addresses) : null

    let [increment, setIncrement ] = useState(0);
    
    const copyElementText = () => {
        let text = document.getElementById('address').innerText
        let elem = document.createElement('textarea');
        document.body.appendChild(elem);
        elem.value = text;
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
    }

        return (
            <Modal
                handleClick={props.handleClick}
                title={'Deposit'}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                           {addresses ? 
                            <QRCode value={addresses[increment]} />
                            : null
                           }
                                <span>
                                <img
                                        src={icon}
                                        alt={`${name}`}
                                        width="30px"
                                    />{' '}
                                    {code} Wallet Address
                                </span>
                    </div>
                }
                footer={
                    <div className="deposit-footer">
                        <div className="deposit-footer-card">
                            <div className="deposit-footer-items">
                                <div>
                                    {addresses 
                                        ? 
                                            <p>To: <strong id='address' style={{color: 'blue'}}>
                                             {addresses[increment]}
                                             </strong>
                                             </p>
                                        :   null
                                    }
                                    


                                </div>
                                {/* Copy Button */}
                                <button 
                                style={{border: 'none', cursor: 'copy'}}
                                onClick={copyElementText}>
                                    <i className="fas fa-copy"></i>
                                </button>

                                {/* Get new addy */}
                                <button onClick={() => setIncrement(increment += 2)} style={{border: 'none'}}>
                                    <i className="fas fa-redo"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                }
                exitModal={props.exitModal}
                exitModalTitle={'Done'}
            />
        );
    };

const mapStateToProps = state => {
    return {
        error: state.error,
        accounts: state.coinbase.accounts,
        paymentMethods: state.coinbase.paymentMethods,
        wallet: state.account.wallet
    };
};

export default connect(mapStateToProps, {})(NetworkTransfer);
