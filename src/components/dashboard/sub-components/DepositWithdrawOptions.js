import React, {useEffect} from 'react';
import Modal from '../../helpers/modal';
import { API_URL } from '../../../../config';

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

              {props.code === 'BTC' ? 
            (    <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
              }}
              
              onClick={props.handleCoinbaseClick}
                >

            {!props.coinbaseInDB &&
              <a 
             style={{
               position: 'absolute',
               width: '100%',
               height: '50%',
               zIndex: '1000',
               bottom: '0',
               left: '0'
             }}
             href={`${API_URL}/auth/coinbase`}>
              </a>
            }

 
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
            ): null
            }
</div>
        }
    />
    );
}

export default DepositWithdrawOptions