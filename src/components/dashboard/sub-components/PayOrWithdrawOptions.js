import React from 'react';
import Modal from '../../helpers/modal';
import './subcomponent.css';

const PayOrWithdrawOptions = props => {

    return (
        <Modal
            handleClick={props.handleClick}
            // handleSubmit={}
            title={props.title}
            headerStyle={{
                backgroundColor: '#0082f9',
                color: '#ffffff',
            }}
            modalBody={props.paymentMethods.map((pay, i) => (
                <div
                    onClick={() => {
                        props.handleReturnObj('pay', props.paymentMethods[i]);
                        props.handleClick();
                    }}
                    key={i}
                    className="pick-crypto-buy"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '10px',
                    }}
                >
                    <div>
                        <p>
                            <strong>Pay With:</strong>
                        </p>
                    </div>
                    <div>
                        <p>{pay.name}</p>
                    </div>
                </div>
            ))}
            // footer={
            //     <div className="deposit-footer">
            //         <div className="deposit-footer-card">
            //             <div className="deposit-footer-items"></div>
            //         </div>
            //     </div>
            // }
            submitType={'submit'}
            sendButtonTitle={'Confirm'}
        />
    );
};

export default PayOrWithdrawOptions;
