import React from 'react';
import Modal from '../../helpers/modal';
import './subcomponent.css';

const Confirm = props => {
    let {
        fee,
        amount,
        total,
        subtotal,
        unit_price,
        status,
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
                        <p> {props.payWith}</p>
                    </div>

                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingTwo}</strong>
                        </p>
                        <p>
                            ${unit_price.amount} / {unit_price.currency}
                        </p>
                    </div>

                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingThree}</strong>
                        </p>
                        <p>${subtotal.amount}</p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingFour}</strong>
                        </p>
                        <p>${fee.amount}</p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingFive}</strong>
                        </p>
                        <p>
                            {amount.amount} {amount.currency}
                        </p>
                    </div>
                    <div className="flex-spacebtwn">
                        <p>
                            <strong>{props.headingSix}</strong>
                        </p>
                        <p>${total.amount}</p>
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

export default Confirm;
