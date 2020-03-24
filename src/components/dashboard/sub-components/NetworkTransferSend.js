import React, { useState } from 'react';
import RenderSuccess from '../../helpers/sucess'
import RenderError from '../../helpers/errors';
import Spinner from '../../helpers/spinner';

import './subcomponent.css';

import Modal from '../../helpers/modal';

import { connect } from 'react-redux';
import { getBalance } from '../../../actions/walletActions'


const NetworkTransferSend = props => {
    let { name, code, icon } = props.showWithdrawCrypto
    let wallet = props.wallet
    
    let account = props.account ? props.account : null

    const [sendToAddress, setSendToAddress] = useState('')
    const [sendAmount, setSendAmount] = useState(0);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    
    
    // const copyElementText = () => {
    //     let text = document.getElementById('address').innerText
    //     let elem = document.createElement('textarea');
    //     document.body.appendChild(elem);
    //     elem.value = text;
    //     elem.select();
    //     document.execCommand('copy');
    //     document.body.removeChild(elem);
    // }


    const handleSubmit = e => {
        e.preventDefault();


        if(sendToAddress && (sendAmount > 0)){

            setShowSpinner(true)

            let address = sendToAddress


            wallet.sendPayment({
                to:  {[address]: [sendAmount]},
            }).then(function(txid){
                setShowSpinner(false);
                console.log("Successfully sent Transaction! " + txid);
                props.getBalance(wallet)
                setSuccess("Successfully sent transaction! " + txid)
            }).catch(function(error){
                setShowSpinner(false);
                console.error("Unable to send Transaction!", error)
                setError("Unable to send transaction!", error)
            })

    } else {
        setShowSpinner(false);
    }

}


        return (
            <Modal
                handleClick={props.handleClick}
                handleSubmit={e => handleSubmit(e)}
                title={'Withdraw'}
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
                        className="deposit-dollarsign">{code}</span>
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
                                    <strong>Balance: </strong>{(account.balance[name] - Number(sendAmount)).toFixed(8)} {code}          
                                    </p>
                            </div>
                            <div className="deposit-footer-items">
                                <p>
                                <strong>Total: </strong>
                                ${(((Number(sendAmount)) * account.exchangeRate[name])).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    )

                }
                submitType={'submit'}
                sendButtonTitle={`Send`}
                exitModal={props.exitModal}
                exitModalTitle={'Done'}
            />
        );
    };

const mapStateToProps = state => {
    return {
        error: state.error,
        wallet: state.account.wallet,
        account: state.account,

    };
};

export default connect(mapStateToProps, {getBalance})(NetworkTransferSend);
