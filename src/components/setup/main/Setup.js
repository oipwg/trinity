// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { API_URL, WEB_SOCKET_URL } from '../../../../config.js';
import { connect } from 'react-redux';
import { addProvider, addBittrex } from '../../../actions/setupActions.js';
import Navigation from '../nav/Navigation';
import './setup.css';
let socket = new WebSocket( WEB_SOCKET_URL );

const Setup = props => {
    const userdata = props.userData
    const [SpartanBot, setSpartanBot] = useState({})
    const bittrexData = props.setupBittrex
    const userId = useRef('');
    const index = useRef(0);
    const merge = ( ...objects ) => ( [...objects] );

    socket.onopen = (e) => {
        socket.send(JSON.stringify({action: 'connect'}));
    };

    socket.onmessage = (e) => {
        if (e.data === '__ping__') {
            console.log('Still alive')
            socket.send(JSON.stringify({keepAlive: true}));
        }
    }
    // Right before refreshes saves current state to local stroage
    window.onunload = function(event) {
        if(bittrexData.credentials) {
            const bittrexState = JSON.stringify(bittrexData);
            sessionStorage.setItem('bittrex', bittrexState)
        }
        
        if(userdata.length > 0 && userdata[0].credentials) {
            const serializedState = JSON.stringify(userdata);
            sessionStorage.setItem('provider', serializedState)
        } 
    };

    const auto_setup_provider = (providers) => {
        if(providers.length > 0 && !userdata.length) {
    
            index.current = providers.length
            for(let provider of providers) {
                setup_Provider({
                    provider: provider.rental_provider,
                    rental_provider: provider.rental_provider,
                    userId: userId.current,
                    to_do: 'add',
                    login: true
                })
            }
        }
    }
    const auto_setup_bittrex = () => {
        setup_Provider({bittrex: 'bittrex'})
    }
 
    useEffect(() => {
        select_provider_option(userdata) 
        // If global state is empty from changing pages will check local storage and fill current state
        if(!userdata.length){
            const providerState = JSON.parse( sessionStorage.getItem('provider') )
            const bittrexState = JSON.parse( sessionStorage.getItem('bittrex') )
            if(providerState !== null) {
                props.dispatch( addProvider(providerState) ) 
            }
            if(bittrexState !== null) {
                props.dispatch( addBittrex(bittrexState) ) 
            }
        } else {
            select_provider_option( userdata )
        }
        if (props.user) {
            let id = props.user._id || props.user.id
            userId.current = id
            auto_setup_provider(props.login)
            auto_setup_bittrex()
        }
        
    }, [props.user, props.login])

    //Updates sessionStorage with provider when page change
    useEffect(() => {
        if(props.SpartanBot) {
            console.log(props.SpartanBot)
            let spartan = {spartan: props.SpartanBot}
            const serializedState = JSON.stringify(props.SpartanBot);
            sessionStorage.setItem('spartanbot', serializedState)
            
            setSpartanBot({...SpartanBot, ...spartan})
        }
        return () => {
            if(bittrexData.credentials) {
                const bittrexState = JSON.stringify(bittrexData);
                sessionStorage.setItem('bittrex', bittrexState)
            }
            
            if(userdata.length > 0 && userdata[0].credentials) {
                const serializedState = JSON.stringify(userdata);
                sessionStorage.setItem('provider', serializedState)
            } 
        }
    }, [])


    function select_provider_option(userData) {
        if(userData.length) {
            let selectedProvider = userData[0].provider
            document.getElementsByClassName('provider')[0].value = selectedProvider
        }
    }
    
    
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
        if (userdata.length) {
            let newState = [], length = userdata.length, i = 0
            
            if (userdata.provider === target){
                return;
            } 
            
            while(i < length) {
                let prevState = userdata[i]
                // Runs if only one or more providers selected
                if (prevState.err && length > 1) {

                    newState.length = []
                    //Includes the error element and all other elements if there are any
                    let allOtherElements = userdata.filter(el => el.provider !== target) 
                    // Keeps target element rendering to the top
                    let targetElement = userdata.filter(el => el.provider === target)
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
            props.dispatch(addProvider(newState[0]))
        } else {
            props.dispatch(addProvider([options]) )
        }
    }

    function set_pool_values(e) {
        index.current = 0
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
        userdata[0].rental_provider = userdata[0].provider
        let sentData = {...userdata[0], poolData:{...poolData}}
        sentData.to_do = 'add'
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

        props.dispatch(addBittrex(options))
        setup_Provider(options)
    }
    function set_provider_values(e) {
        index.current = 0
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
        let sentData = {...userdata[0], ...options}
        sentData.to_do = 'add'
        setup_Provider(sentData)
    }

    let signInData = []
    
    function process_returned_data(data) {
        console.log('data:', data)
        console.log('SPARTANBOT: ', SpartanBot)
        if (data.provider === "Bittrex") {
            console.log('BITTREX', data)
            props.dispatch(addBittrex({...data}))
  
        } else {
            let responseData = {}
           
            
            
            for (let key in data) {
                let value = data[key]
                let property = key
   
                switch (property) {
                    case 'err': 
                        responseData[property] = value
                        break;
                    case 'message':
                        responseData[property] = value
                        break;
                    case 'pool':
                        responseData[property] = value
                        break;
                    case 'credentials':
                        responseData[property] = value
                        break;
                    case 'success':
                        responseData[property] = value
                        break;
                    case 'provider':
                        responseData[property] = value
                        responseData.rental_provider = value
                        break;
                    case 'spartan':
    
                        // responseData[property] = value
                        sessionStorage.setItem('spartanbot', JSON.stringify(value))
                }
            }
            
            // If index is greater than 0 then it's return data from signIn or new page from auto_setup_provider only
            console.log(index.current, signInData.length)
            if(index.current) {
                signInData.push(responseData)

                // Update providers when all have been pushed
                if (index.current === signInData.length) {
                    console.log('signInData:', signInData)
                    props.dispatch( addProvider(signInData) )
                }
            } else {
                console.log('responseData:', responseData)
                // Top exsisting data / object, and response object that came back merged together
                let allData = {...userdata[0], ...responseData}

                if ( userdata.length > 1) {
                    props.dispatch(addProvider( merge(allData, userdata[1]) ))
                } else {
                    props.dispatch(addProvider([allData]))
                }
            }
            
        }
    };

    async function setup_Provider(data) {


        data.userId = userId.current
        // let spartan = JSON.parse(sessionStorage.getItem('spartanbot'))
        // console.log('spartan:', spartan)
        // data.spartanbot = spartan ? JSON.parse(sessionStorage.getItem('spartanbot')) : ''
        console.log(data)
        const endPoint = data.bittrex ? '/auth/bittrex' : '/setup';

        try {
            const response = await fetch(API_URL + endPoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
  
            let res = await response.json()
            console.log('res:', res.data)

            process_returned_data(res.data)
        } catch (e) {
            console.log('Catch error: Setup.js line 232',e)
            process_returned_data({err: e})
        }
    }

    const showPool = props => {
        if (userdata[0] === undefined || userdata[0].pool === undefined ) {
            return true
        } else {
            return userdata[0].pool;
        }
    }

    const addPool = (e) => {
        let provider = e.target.dataset.provider
        console.log('provider ADD POOL:', provider)
        let newState = []
        for(let i = 0; i < userdata.length; i++) {
            if(userdata[i].provider === provider) {

                newState[0] = {...userdata[i], pool: false}
            } else {
                newState[1] = userdata[i]
            }
        }
        props.dispatch(addProvider(newState))
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
        let boolean = !userdata.length ? false : userdata[0].success
        return boolean
    }

    const goToSettings = () => {

        return props.history.push('/dashboard');
    }

    const dropDownValue = (userData) => {
        if(userData.length === 0) {
            return ''
        } else {
            return userData[0].provider
        }
    }

    const showMessage = (field, i) => {

        let data = userdata[i]
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
                            <button type="submit" data-provider={userdata[i].provider} className="btn btn-primary add-pool" onClick={addPool}>
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
        {console.log(SpartanBot)}
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
                                return (
                                    userdata.map( (userData, i)=> {
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
                                    value={dropDownValue(userdata)}
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
                            <div style={{height: showCredentials(userdata).boolean ? '0px' : showCredentials(userdata).height }} 
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
                        {/* {console.log('showPool',showPool())} */}
                        {/* End of rental passwords */}
                        <Pools poolBoolean ={showPool}/>
                        {!showProviderButton(userdata) && 
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
                        <select id="algo" className="custom-select mx-sm-4" required>
                            <option value="">
                                Select Algorithm
                            </option>
                            <option value="Scrypt">Scrypt</option>
                            <option value="X16rv2">X16rv2</option>
                        </select>
                    </div>
                    <div className="selector-group-child">
                        <label className="my-1 mr-2">Pool Priority</label>
                        <select id="priority" className="custom-select mx-sm-4" required>
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
    console.log('state:', state)
    return {
        SpartanBot: state.auth.SpartanBot,
        user: state.auth.user,
        userData: state.userData,
        login: state.login,
        setupBittrex: state.setupBittrex
    };
};

export default connect(mapStateToProps)(Setup);

