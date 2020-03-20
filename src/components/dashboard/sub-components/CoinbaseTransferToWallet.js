import React, { useState } from 'react';
import RenderSuccess from '../../helpers/sucess'
import RenderError from '../../helpers/errors';
import Spinner from '../../helpers/spinner';

import './subcomponent.css';

import Modal from '../../helpers/modal';

import { connect } from 'react-redux';
import {sendFunds} from '../../../actions/coinbaseActions'


const CoinbaseTrasnferToWallet = props => {
    console.log(props)
    // let { name, code, icon } = props.showDepositCrypto 
    // let wallet = props.wallet
    let transID =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let account = props.account ? props.account : null
    let btcBalance = account.wallet.balance.amount
    let addresses = props.localWallet ? Object.keys(props.localWallet.coins.bitcoin.accounts[0].addresses) : null


    const [sendToAddress, setSendToAddress] = useState(addresses[0])
    const [success, setSuccess] = useState(null);
    const [sendAmount, setSendAmount] = useState(btcBalance);
    const [cb2Fa, setcb2Fa] = useState('');
    const [error, setError] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    
    
    const copyElementText = () => {
        let text = document.getElementById('address').innerText
        let elem = document.createElement('textarea');
        document.body.appendChild(elem);
        elem.value = text;
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
    }




    const handleSubmit = e => {
        e.preventDefault();

        if(sendToAddress.length !== 34){
            return;
        }

        props.sendFunds(
            account.wallet.id,
            sendToAddress,
            sendAmount,
            'BTC',
            'Send to Trinity Wallet',
            null,
            transID,
            cb2Fa
             
        ).then(res => {
            console.log('res b', res)
        })
}


        return (
            <Modal
                handleClick={props.handleClick}
                handleSubmit={e => handleSubmit(e)}
                title={'Send to My Wallet'}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                classname={'withdraw-send'}
                modalBody={
                    showSpinner ? 
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '25vh'}}>
                        <Spinner />
                    </div>
                    : 
                   (<div className="deposit-input">
                        <span 
                        style={{fontSize: '24px'}}
                        className="deposit-dollarsign"></span>
                        <input
                            autoFocus={true}
                            onChange={e => {
                                let amount = e.target.value;

                                amount.match(/^\d*\.?\d*$/) ?
                                    setSendAmount(e.target.value) : null

                            }}
                            minLength="1"
                            type="tel"
                            placeholder="0"
                            fontSize="62"
                            className="deposit-modal"
                            value={sendAmount}
                        />
                    </div>)
                   
                }
                footer={
                    showSpinner ? null : (
                        <div className="deposit-footer">
                        <div className="deposit-footer-card">
                            <div className="deposit-footer-items">
                                <div style={{display: 'flex', width: '100%', marginBottom: '1rem'}} >
                                    <label>To:</label>
                                    <input
                                        onChange={e => {
                                            setSendToAddress((e.target.value))
                                        }}
                                        style={{marginLeft: '5px', flex: '1 1 auto'}}
                                        type="text"
                                        placeholder="Wallet Address"
                                        value={sendToAddress}
                                     />
                                </div>
                            </div>
                            {
                            error && 
                            <RenderError message={error} />
                            }
                            {
                            success &&
                            <RenderSuccess message={success} />
                            }
                            <div className="deposit-footer-items">
                                    <p>
                                    <strong>Coinbase Balance: </strong>{(btcBalance - sendAmount).toFixed(8)} BTC          
                                    </p>
                            </div>
                            <div className="deposit-footer-items">
                                    <p>
                                    <strong>Fee: </strong> BTC          
                                    </p>
                            </div>
                            <div className="deposit-footer-items">
                                    <label>2FA:</label>
                                    <input
                                        onChange={e => {
                                            setcb2Fa((e.target.value))
                                        }}
                                        // style={{marginLeft: '5px', flex: '1 1 auto'}}
                                        type="text"
                                        placeholder="2FA"
                                     />
                            </div>
                        </div>
                    </div>
                    )

                }
                submitType={'submit'}
                sendButtonTitle={
                    cb2Fa.length === 7 ? 'Confirm' : 'Send'
                }


                exitModal={props.exitModal}
                exitModalTitle={'Done'}
            />
        );
    };

const mapStateToProps = state => {
    return {
        error: state.error,
        localWallet: state.account.wallet,
        account: {
            wallet: state.coinbase.accounts.data.find(obj => {
                if(obj.currency.code === 'BTC'){
                    return obj.balance
                }
            })
        }


    };
};

export default connect(mapStateToProps, {sendFunds})(CoinbaseTrasnferToWallet);
