import React from 'react';
import Modal from '../../helpers/modal';

const DepositWithdrawOptions = (props) => {
    return (
        <Modal
        handleClick={props.handleClick}
        handleSubmit={e => handleSubmit(e)}
        title={props.title}
        headerStyle={{
            backgroundColor: '#0082f9',
            color: '#ffffff',
        }}
        modalBody={
            <div>

            {/* ADDRESS! */}
              <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
              }}

              onClick={props.handleCryptoAddressClick}

              >

              <span style={{ flex: '.6 1 0'}}>

              <i  
                style={{fontSize: '32px'}}
              className="fas fa-qrcode"></i>
              </span>
                <div style={{ flex: '1 1 auto'}}>
                <span>
                <strong>Crypto Address</strong>
                </span>
                <p>Network transfer</p>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>

                
                
                {/* COINBASE */}
                <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
              }}
              
              onClick={props.handleCoinbaseClick}
                >

                <span style={{ flex: '1 1 auto'}}>
                {props.coinbaseLogo}
                </span>
            <div style={{ flex: '1 1 auto'}}>
                <span>
                <strong>Coinbase</strong>
                </span>
                <p>Transfer funds from Coinbase.com</p>
               </div>
                <i className="fas fa-chevron-right"></i>
                </div>
            </div>
            

        }
    />
    );
}

export default DepositWithdrawOptions