import React from 'react';
import './modal.css'

const Modal = props => {

    return (
        <>
            <div
                className={`modal fade show ${props.classname}`}
                id="exampleModalCenter"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true"
                style={{ display: 'block', background: '#0000004a' }}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    role="document"
                >
                    <div className="modal-content">
                        <div className="modal-header" style={props.headerStyle}>
                            <h5
                                className="modal-title"
                                id="exampleModalCenterTitle"
                            >
                                {props.title}
                            </h5>
                            <button
                                onClick={props.handleClick}
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className={`modal-body ${props.classname}`}>
                            {props.modalBody}
                        </div>
                        
                    {props.footer 
                        ? 
                            <div className="modal-footer">
                                {props.footer}

                            {props.handleSubmit 
                                ?     
                                    (<button
                                        onClick={props.handleSubmit}
                                        type={
                                            props.submitType
                                                ? props.submitType
                                                : 'button'
                                        }
                                        className="btn btn-primary"
                                    >
                                        {props.sendButtonTitle}
                                    </button>)
                                : null
                            }
                                
                            {props.exitModalTitle 
                                ? 
                                    (<button
                                        onClick={props.exitModal}
                                        className="btn btn-secondary"
                                    >
                                    {props.exitModalTitle}
                                    </button>)
                                : null 
                            }

                            </div>
                    
                        : null} 

                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
