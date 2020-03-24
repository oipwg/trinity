import React from 'react';
import Modal from '../../helpers/modal';
import './subcomponent.css';

const ConfirmReceipt = props => {

    let {
        status,
        sent,
        currency,
        description,
        fee,
        transaction_amount,
        address_url,
    } = props.confirmOrder;

    return (
        <Modal
            handleClick={props.handleClick}
            handleSubmit={props.handleSubmit}
            title={props.title}
            headerStyle={{
                backgroundColor: '#0082f9',
                color: '#ffffff',
            }}
            modalBody={
                <div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingOne}</strong>
                        </p>
                        <p> {status}</p>
                    </div>

                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingTwo}</strong>
                        </p>
                        <p>
                            {sent} / {currency}
                        </p>
                    </div>

                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingThree}</strong>
                        </p>
                        <p>{description}</p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingFour}</strong>
                        </p>
                        <p>{fee} / {currency}</p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingFive}</strong>
                        </p>
                        <p>
                            {transaction_amount} / {currency}
                        </p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingSix}</strong>
                        </p>
                        <a href={address_url} target="_blank">View transaction</a>
                    </div>
                </div>
            }
            footer={
                <div className="deposit-footer">
                    <div className="deposit-footer-card">
                        <div className="deposit-footer-items"></div>
                    </div>
                </div>
            }
            submitType={'submit'}
            sendButtonTitle={`Confirm`}
        />
    );
};

export default ConfirmReceipt;
