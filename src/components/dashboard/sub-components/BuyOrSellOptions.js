import React from 'react';
import Modal from '../../helpers/modal';
import './subcomponent.css';

const BuyOrSellOptions = props => {

    return (
        <Modal
            handleClick={props.handleClick}
            // handleSubmit={}
            classname={'buyorsell-options'}
            title={props.title}
            headerStyle={{
                backgroundColor: '#0082f9',
                color: '#ffffff',
            }}
            modalBody={props.crypto.map((coin, i) => (
                <div
                    onClick={() => {
                        props.handleReturnObj('buy', props.crypto[i]);
                        props.handleClick();
                    }}
                    key={i}
                    style={{}}
                >
                    <p>{coin.currency.name}</p>
                    
                </div>
            ))}
            // footer={
            //     <div className="deposit-footer">
            //         <div className="deposit-footer-card">
            //             <div className="deposit-footer-items"></div>
            //         </div>
            //     </div>
            // }
            // submitType={'submit'}
            // sendButtonTitle={'Confirm'}
            footer={null}
        />
    );
};

export default BuyOrSellOptions;
