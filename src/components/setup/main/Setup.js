import React, { useState, useEffect, useRef } from 'react';
import './setup.css';
import { API_URL } from '../../../../config.js';
import { connect } from 'react-redux';
import { addProvider } from '../../../actions/setupActions.js';
import Navigation from '../nav/Navigation';

const Setup = props => {
    const [userData, setUserData] = useState([]);
    const [bittrexData, setBittrexData] = useState({data: {}});
    const userId = useRef('');
  

    useEffect(() => {
        if (props.user) {
            let id = props.user._id || props.user.id

            userId.current = id
        }
    }, [props.user])

    const merge = ( ...objects ) => ( [...objects] );

    function set_rental_provider(e) {

        let target = e.target.options[e.target.selectedIndex].value 
     
        if (!target) return

        let options = {
            userId: userId.current,
            provider: target,
            credentials: false,
            pool: undefined,
            success: false,
            err: ''
        }
       
        // If there is user data merge it with the new data
        if (userData.length) {
            let newState = [], length = userData.length, i = 0

            if (userData[0].provider === target){
                return;
            } 

            while(i < length) {
                let prevState = userData[i]
                // Runs if only one or more providers selected
                if (prevState.err && length > 1) {
                    // Clears any elements cached in the array previously
                    newState.length = []
                    //Includes the error element and all other elements if there are any
                    let allOtherElements = userData.filter(el => el.provider !== target) 
                    // Keeps target element rendering to the top
                    let targetElement = userData.filter(el => el.provider === target)
                    let data = merge(...targetElement, ...allOtherElements)

                    
                    newState.push(data)
                    break;
                }
                if (prevState.provider !== target) {
                    let data = merge(options, prevState)
                    newState.push(data)
                }
                i++
            }
     
            addProvider(newState[0])
            setUserData(newState[0])
        } else {
            addProvider([options])
            setUserData([options])
        }
       
    }

    function set_pool_values(e) {
        e.preventDefault();
        const form = document.getElementsByClassName('wizard-form')[0]
        const form_inputs = form.elements

        let length = form_inputs.length
        let poolData = {}
        for (let i = 0; i < length; i++) {
            const el = form_inputs[i];
         
            if ( el.tagName === "SELECT" || el.tagName === "INPUT") {
                switch (el.id) {
                    case 'profile-name':
                        poolData.profileName = el.value
                        el.value = ''
                        break
                    case 'pool-name':
                        poolData.name = el.value
                        el.value = ''
                        break;
                    case 'algo':
                        poolData.algo = el.options[el.selectedIndex].value.toLowerCase()
                        break;
                    case 'priority':
                        poolData.priority = el.options[el.selectedIndex].value
                        break;
                    case 'host':
                        poolData.host = el.value
                        el.value = ''
                        break;
                    case 'port':
                        poolData.port = el.value
                        el.value = ''
                        break;
                    case 'wallet':
                        poolData.user = el.value
                        el.value = ''
                        break;
                    case 'pool-password':
                        poolData.pass = el.value
                        el.value = ''
                        break;
                    case 'pool-notes':
                        poolData.notes = el.value
                        el.value = ''   
                }
            }
        }
        //Adds the rental_provider key again
        userData[0].rental_provider = userData[0].provider
        let sentData = {...userData[0], poolData:{...poolData}}

        setup_Provider(sentData)
    }
    function set_bittrex_values(e) {
        e.preventDefault();
        const form = document.getElementsByClassName('bittrex-form')[0]
        const form_inputs = form.elements
        let length = form_inputs.length
        let options = {}

        for (let i = 0; i < length; i++) {
            const el = form_inputs[i];
            
            switch (el.id) {
                case 'bittrex':
                    options.bittrex = el.value
                    break;
                case 'bittrex_key':
                    options.apiKey = el.value
                    el.value = ''
                    break;
                case 'bittrex_secret':
                    options.secret = el.value
                    el.value = ''
                    break;
            }    
        }
        options.userId = userId.current
        setup_Provider(options)
    }
    function set_provider_values(e) {
        e.preventDefault();
        const form = document.getElementsByClassName('wizard-form')[0]
        const form_inputs = form.elements
        let length = form_inputs.length
        let options = {}
 
        for (let i = 0; i < length; i++) {
            const el = form_inputs[i];
            
            if ( el.tagName === "SELECT" || el.tagName === "INPUT") {
                switch (el.id) {
                    case 'rental_provider':
                        options.rental_provider = el.options[el.selectedIndex].value
                        break;
                    case 'key':
                        options.api_key = el.value
                        el.value = ''
                        break;
                    case 'secret':
                        options.api_secret = el.value
                        el.value = ''
                        break;
                    case 'id':
                        options.api_id = el.value
                        el.value = ''
                        break;
                }    
            }
        }

        // **** WILL COME BACK AND CHECK MAKE SURE FIELDS ALL EXIST  ****
        for(let prop in options ) {
            if (options.hasOwnProperty(prop)) {
                // console.log(options[prop] === '')
            }
        }

        // Merges the existing data when selecting provider with added data from "Add Provider" button
        let sentData = {...userData[0], ...options}

        setup_Provider(sentData)
    }

    
    function process_returned_data(data) {
        if (data.provider === "Bittrex") {
            setBittrexData({...data})
        } else {
            let responseData = {}
            for (let key in data) {
                let value = data[key]
                let property = key
        
                switch (property) {
                    case 'err': 
                        responseData[property] = value
                    case 'message':
                        responseData[property] = value    
                    case 'pool':
                        responseData[property] = value
                    case 'credentials':
                        responseData[property] = value
                    case 'success':
                        responseData[property] = value
                }
            }

            // Top exsisting data / object, and response object that came back merged together
            let allData = {...userData[0], ...responseData}
            
            if ( userData.length > 1) {
                setUserData(merge(allData, userData[1]))
            } else {
                setUserData([allData])
            }
        }
    };

    async function setup_Provider(data) {
        // Hits /bittrex endpoint when adding credentials the rest hits /setup
        const endPoint = data.bittrex ? '/auth/bittrex' : '/setup';
        console.log('endPoint:', endPoint)

        try {
            const response = await fetch(API_URL + endPoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        
            let res = await response.json()
            process_returned_data(res.data)
        } catch (e) {
            console.log('Catch error: Setup.js line 232',e)
            process_returned_data({err: e})
        }
    }

    const showPool = props => {
        // return false
        if (userData[0] === undefined || userData[0].pool === undefined ) {
            return true
        } else {
            return userData[0].pool;
        }
    }
    const addPool = (e) => {
        let provider = e.target.dataset.provider
        let newState = []
        for(let i = 0; i < userData.length; i++) {
            if(userData[i].provider === provider) {

                newState[0] = {...userData[i], pool: false}
            } else {
                newState[1] = userData[i]
            }
        }
        setUserData(newState)
    }

    const showProviderButton = (userData) => {
        if(userData[0] !== undefined) {
            return userData[0].success
        } else {
            return false
        }
    }

    const showCredentials = userdata => {
        let height = (() => {
            if ( userdata.length ) {
                return userdata[0].provider === 'MiningRigRentals' ? '126px' : '169px'
            } else 
                return '0px'
        })();
   
        let boolean = !userdata.length ? true : userdata[0].credentials

        return {boolean, height}
    }

    const showBittrexThumb = (bittrexData) => {
        if (bittrexData.credentials) {
            return {
                transform: 'translate(0)',
                opacity: 1
            }
        } else {
            return {
                transform: 'translate(20px)',
                opacity: 0
            }
        }
    }

    const showSuccessBtn = () => {
        let boolean = !userData.length ? false : userData[0].success
        return boolean
    }

    const goToSettings = () => {
        return props.history.push('/dashboard');
    }
    

    const showMessage = (field, i) => {
        
        let data = userData[i]
        switch ( field ) {
            case 'provider':
                if (data.err === field && data.success) {
                    return [
                        data.message,
                        <button key={i} type="submit" className="btn btn-success" onClick={goToSettings}>
                            Continue  >
                        </button>
                    ]    
                }
                if (data.err === field) {
                    return (
                        data.message
                    )
                } else return data.provider
            case 'credentials':
            case 'pool':
                if (data.err === field && data.success) {
    
                    return [
                        data.message,
                        <div key={'pool'}>
                            <button type="submit" data-provider={userData[i].provider} className="btn btn-primary add-pool" onClick={addPool}>
                                Add Pool
                            </button>
                            <button type="submit" className="btn btn-success" onClick={goToSettings}>
                                Continue  >
                            </button>
                        </div>
                    ]    
                } else if (data.err === field) {
                    return (
                        data.message
                    )
                }
                if (data[field] === true) {
                    return (
                        <i key={i} className="fas fa-thumbs-up"></i>
                    )
                } else {
                    return (
                        <i key={i} className="fas fa-thumbs-down"></i>
                    )
                }
            case 'success':
                if (data[field] === true) {
                    return (
                        <i key={i} className="fas fa-thumbs-up"></i>
                    )
                } else {
                    return (
                        <i key={i} className="fas fa-thumbs-down"></i>
                    )
                }
        }
    }

    return (
        <>
        <div className="setup">
        <div className="setup-container">
            <Navigation />
            <div className="credential-container">
            
                <section className="bittrex-section" style={{height: bittrexData.credentials ? '90px' : '315px'}}>
                    <form className="bittrex-form">
                        <div className="credentials">
                                <header>
                                    <h4>Bittrex</h4>
                                    <div className="bittrex-success">
                                        <p>Success</p>
                                        <i style={showBittrexThumb(bittrexData)} className="fas fa-thumbs-up"></i>
                                    </div>
                                </header>
                                <div className="setup-documentation">
                                    <div className="bittrex-visit-link">
                                        {/* <h6>Bittrex Documentation</h6> */}
                                        <aside>
                                            <p className="bittrex-info">
                                                <strong>Create a <a href="https://bittrex.com/account/register" target="_blank">
                                                    bittrex</a> account first if you haven't already.</strong>
                                            </p>
                                        </aside>
                                    </div>
                                    <div className="bittrex-video">

                                    </div>
                                </div>
                                
                                <div className="form-inline">
                                    <input type="hidden" value="bittrex" id="bittrex" name="bittrex" />
                                    <div className="form-groups">
                                        <label htmlFor="key">API key</label>
                                        <input
                                            id="bittrex_key"
                                            type="password"
                                            className="form-control mx-sm-4"
                                            aria-describedby="key"
                                            placeholder="Your api key"/>
                                    </div>
                                </div>
                                <div className="form-inline secret">
                                    <div className="form-groups">
                                        <label htmlFor="secret">Secret</label>
                                        <input
                                            id="bittrex_secret"
                                            type="password"
                                            className="form-control mx-sm-4"
                                            aria-describedby="secret"
                                            placeholder="Your secret"/>
                                    </div>
                                </div>
                            {/* </div> */}
                        </div>
                        <button type="submit" className="btn-submit" onClick={set_bittrex_values}>
                            Add Bittrex
                        </button>
                    </form>
                </section>
                <section className="provider-section">
                    <table className="table">
                        <thead id="wizard-tableHeader">
                            <tr>
                                <th id="rowNumber" scope="col">#</th>
                                <th id="provider" scope="col">Provider</th>
                                <th id="credentials" scope="col">Credentials</th>
                                <th id="pool" scope="col">Pool</th>
                                <th id="success" scope="col">Success</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(()=> {
                                console.log(userData)
                                return (
                                    userData.map( (userData, i)=> {
                                        let dataKeys = Object.keys(userData)
                                        
                                        return (   
                                            <tr key={i} className="data-table-row">
                                                <td >{i}</td>
                                                {dataKeys[0] && (
                                                    <td>{showMessage('provider', i) }</td>
                                                )}
                                                {dataKeys[1] && (
                                                    <td>{showMessage('credentials', i)}</td>
                                                )}
                                                {dataKeys[2] && (
                                                <td>{showMessage('pool', i)}{showSuccessBtn() ? '' :
                                                ''}</td> 
                                                )}
                                                {dataKeys[3] && (
                                                    <td>{showMessage('success', i)}</td> 
                                                )}
                                            </tr>
                                        )
                                    })
                                )
                            })()}
                        </tbody>
                    </table>
                    <form className="wizard-form">
                        <div className="form-inline rental-provider">
                            <h4>Provider</h4>
                            <div className="setup-documentation">
                                    <div className="bittrex-visit-link">
                                        <aside>
                                            <p className="bittrex-info">
                                                <strong>Create a <a href="https://www.nicehash.com/my/register" target="_blank">Nice hash</a> or  
                                                <a href="https://www.miningrigrentals.com/" target="_blank"> Mining rig rental</a> account first if you haven't already.</strong>
                                            </p>
                                        </aside>
                                    </div>
                                    <div className="bittrex-video">

                                    </div>
                                </div>
                            <div className="form-groups">
                                <label className="my-1 mr-2">Rental provider</label>
                                <select
                                required
                                    id="rental_provider"
                                    className="provider custom-select mx-sm-4"
                                    onChange={set_rental_provider}>
                                    <option value="">
                                        Select provider
                                    </option>
                                    <option value="MiningRigRentals">
                                        MiningRigRentals
                                    </option>
                                    <option value="NiceHash">NiceHash</option>
                                </select>
                            </div>
                        </div>
                        <div className="credentials">
                            <div style={{height: showCredentials(userData).boolean ? '0px' : showCredentials(userData).height }} 
                                className="provider-credentials">
                                <h4>Provider Credentials</h4>
                                <div className="form-inline API-key">
                                    <div className="form-groups">
                                        <label htmlFor="key">API key</label>
                                        <input
                                            type="password"
                                            id="key"
                                            className="form-control mx-sm-4"
                                            aria-describedby="key"
                                            placeholder="Your api key"/>
                                    </div>
                                </div>
                                <div className="form-inline secret">
                                    <div className="form-groups">
                                        <label htmlFor="secret">Secret</label>
                                        <input
                                            type="password"
                                            id="secret"
                                            className="form-control mx-sm-4"
                                            aria-describedby="secret"
                                            placeholder="Your secret"/>
                                    </div>
                                </div>
                                <div className="form-inline id">
                                    <div className="form-groups">
                                        <label htmlFor="secret">ID</label>
                                        <input
                                            type="text"
                                            id="id"
                                            className="form-control mx-sm-4"
                                            aria-describedby="id"
                                            placeholder="Organization ID"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {console.log('showPool',showPool())}
                        {/* End of rental passwords */}
                        <Pools poolBoolean ={showPool}/>
                        {!showProviderButton(userData) && 
                            <button type="submit" className="btn-submit" onClick={set_provider_values}
                            style={{display: showPool() ? 'block' : 'none'}}>
                                Add Provider
                            </button>
                        }

                        <button type="submit" className="btn-submit" onClick={set_pool_values}
                        style={{display: showPool() ? 'none' : 'block'}}>
                            Add Pool
                        </button>
                    </form>
                </section>
            </div>
        </div>
        </div>
        </>
    );
};

const Pools = (props) => {
    return (  
        <div className="pools">
            <div style={{height: props.poolBoolean() ? '0px' : '385px' }} className="pool-add">
                <h4>Add A Pool</h4>
                 {/* flex */}
                <div className="selector-groups">
                    <div className="selector-group-child"> 
                   
                        <label className="type my-1 mr-2">Type</label>
                        <select id="algo" className="custom-select mx-sm-4">
                            <option defaultValue value="">
                                Select Algorithm
                            </option>
                            <option value="Scrypt">Scrypt</option>
                            <option value="X16rv2">X16rv2</option>
                        </select>
                    </div>
                    <div className="selector-group-child">
                        <label className="my-1 mr-2">Pool Priority</label>
                        <select id="priority" className="custom-select mx-sm-4">
                            <option defaultValue value="">
                                Select Priority
                            </option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="name">Profile name</label>
                        <input
                            type="text"
                            id="profile-name"
                            className="form-control mx-sm-4"
                            aria-describedby="name"
                            placeholder="Pool profile name"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="name">Pool name</label>
                        <input
                            type="text"
                            id="pool-name"
                            className="form-control mx-sm-4"
                            aria-describedby="name"
                            placeholder="Pool name"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="host">Host</label>
                        <input
                            type="text"
                            id="host"
                            className="form-control mx-sm-4"
                            aria-describedby="algorithm"
                            placeholder="after stratum+tcp://"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="port">Port</label>
                        <input
                            type="text"
                            id="port"
                            className="form-control mx-sm-4"
                            aria-describedby="algorithm"
                            placeholder="8080"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="wallet">Wallet</label>
                        <input
                            type="text"
                            id="wallet"
                            className="form-control mx-sm-4"
                            aria-describedby="Wallet address"
                            placeholder="Workername or wallet address"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="pool-password">Password</label>
                        <input
                            type="text"
                            id="pool-password"
                            className="form-control mx-sm-4"
                            aria-describedby="pool password"
                            placeholder="Password usually x"
                        />
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="pool-notes">Notes</label>
                        <input
                            type="text"
                            id="pool-notes"
                            className="form-control mx-sm-4"
                            aria-describedby="pool-notes"
                            placeholder="Notes"
                        />
                    </div>
                </div>
            </div>{' '}
        </div>
    )
}


const mapStateToProps = state => {
    return {
        isAuthneticated: state.auth.isAuthneticated,
        user: state.auth.user,
        success: state.success,
    };
};

export default connect(mapStateToProps)(Setup);

