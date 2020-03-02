import React, { useState, useEffect } from 'react';
import Navigation from '../nav/Navigation';
import './setup.css';

const Setup = () => {
    const [userData, setUserData] = useState([]);
    const [poolIsOpen, setPoolOpen] = useState('')

    useEffect(() => {
        if (userData[0] !== undefined) {
            // setPoolOpen(userData[0].pool)
        }
    })

    const merge = ( ...objects ) => ( [...objects] );

    function set_rental_provider(e) {
        e.preventDefault();
        // const merge = ( ...objects ) => ( [...objects] );
        let target = e.target.options[e.target.selectedIndex].value

        if (!target) return

        let options = {
            provider: target,
            credentials: false,
            pool: true,
            success: false,
            err: ''
        }
       
        
        // If there is user data merge it somehow with the new data
        if (userData.length) {
   
            let newState = []
            let length = userData.length 
            let i = 0
            while(i < length) {
                let prevState = userData[i]
                if (prevState.err && length > 1) {
                    // Clears any elements left in array previously
                    newState.length = []
                    //Includes the error element and all other elements if there are any
                    let allOtherElements = userData.filter(el => el.provider !== target) 
                    // Keeps target element rending to the top
                    let targetElement = userData.filter(el => el.provider === target)
                    let data = merge(...targetElement, ...allOtherElements)

                    console.log('data:', data)
                    
                    newState.push(data)
                    break;
                } if (prevState.provider !== target) {
        
                        let data = merge(options, prevState)
                        newState.push(data)
                    }
                i++
            }
            // *** USE BELOW IF ABOVE BREAKS ***
            // userData.map( prevState => {
                // if (prevState.provider !== target) {
                //     let data = merge(options, prevState)
                //     return setUserData(data)
                // } 
            // })
     
            setUserData(newState[0])
        } else {
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
                    case 'pool-name':
                        poolData.profileName = el.value
                        break;
                    case 'algo':
                        poolData.algo = el.options[el.selectedIndex].value
                        break;
                    case 'port':
                        console.log(el.value)
                        poolData.port = el.value
                        break;
                    case 'wallet':
                        poolData.user = el.value
                        break;
                    case 'pool-password':
                        poolData.pass = el.value
                        break;
                    case 'pool-notes':
                        poolData.notes = el.value     
                }    
            }
        }
        
        let sentData = {...userData[0], poolData:{...poolData}}
        console.log(sentData)
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
                        options.key = el.value
                        break;
                    case 'secret':
                        options.secret = el.value
                        break;  
                }    
            }
        }
        
        for(let prop in options ) {
            if (options.hasOwnProperty(prop)) {
                // console.log(options[prop] === '')
            }
        }

        form.reset();
        let sentData = {...userData[0], ...options}
        console.log('sentData:', sentData)
  
        console.log(merge(userData[1], sentData))
        // setUserData([sentData])
        setup_Provider(sentData)
    }

    
    function process_returned_data(data) {
        console.log(data)
        let responseData = {}
        for(let key in data) {
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
        // const merge = ( ...objects ) => ( [...objects] )

        // Top object, and response object that came back
        let allData = {...userData[0], ...responseData}
        if ( userData.length > 1) {
           console.log( merge(allData, userData[1]))
           setUserData(merge(allData, userData[1]))
        } else {
            setUserData([allData])
        }
    }

    async function setup_Provider(data) {
        console.log('setup_Provider ran', data)
        try {
            const response = await fetch('http://localhost:5000/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        
            let res = await response.json()
           console.log(res)
            process_returned_data(res.data)
        }catch (e) {
            console.log('Catch error: ',e)
            process_returned_data({err: e})
        }
    }
    const showPool = props => 
        userData[0] === undefined ? true : userData[0].pool;
    

        
        

    const showCredentials = (userdata) => {
        console.log(userdata)
        let boolean = !userdata.length || userdata.credentials === false ? false : true
        console.log('boolean:', boolean)
        
        return boolean
    }

    return (
        <section className="wizard">
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
                            userData.map( (userData, i)=> {
                                let dataKeys = Object.keys(userData)
                     
                                return (   
                                    <tr key={i} className="data-table-row">
                                        <td key={i+1}>{i}</td>
                                        {dataKeys[0] && (
                                            <td key={i+2}>{userData.err === "provider" ? userData.message : 
                                            userData.provider}</td>
                                        )}
                                        {dataKeys[1] && (
                                            <td key={i+3}>{userData.credentials ? <span>&#10004;</span> :
                                            <i className="fas fa-thumbs-down"></i>}</td>
                                        )}
                                        {dataKeys[2] && (
                                            <td key={i+4}>{userData.err === "pool" ? userData.message : 
                                            <i className="fas fa-thumbs-down"></i>}</td> 
                                        )}
                                        {dataKeys[3] && (
                                            <td key={i+5}>{userData.success ? <span>&#10004;</span> : 
                                            <i className="fas fa-thumbs-down"></i>}</td> 
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
                    <div className="form-groups">
                        <label className="my-1 mr-2">Rental provider</label>
                        <select
                            id="rental_provider"
                            className="provider custom-select mx-sm-4"
                            onChange={set_rental_provider}>
                            <option defaultValue value="">
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
                    {/* {console.log(userData[0].credentials)} */}
                    <div style={{height: showCredentials(userData) ? '125px' : '0px'}} className="provider-credentials">
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
                    </div>
                </div>
               
                {/* End of rental passwords */}
                <Pools poolBoolean ={showPool}/>
                {/* End of pool information */}

                <button type="submit" className="btn-submit" onClick={set_provider_values}
                style={{display: showPool() ? 'block' : 'none'}}>
                    Add Provider
                </button>
                    
                <button type="submit" className="btn-submit" onClick={set_pool_values}
                style={{display: showPool() ? 'none' : 'block'}}>
                    Add Pool
                </button>
            </form>
        </section>
    );
};
const Pools = (props) => {

    // const showPool = props => 
    //     props.poolBoolean === undefined ? true : props.poolBoolean.pool;
    
    return (  
        <div className="pools">
            {console.log(props.poolBoolean())}
            <div style={{height: props.poolBoolean() ? '0px' : '310px' }} className="pool-add">
                <h4>Add A Pool</h4>
                <div className="form-inline">
                    <div className="form-groups">
                        <label className="my-1 mr-2">Type</label>
                        <select id="algo" className="custom-select mx-sm-4">
                            <option defaultValue value="">
                                Select Algorithm
                            </option>
                            <option value="Scrypt">Scrypt</option>
                            <option value="X16rv2">X16rv2</option>
                        </select>
                    </div>
                </div>
                <div className="form-inline">
                    <div className="form-groups">
                        <label htmlFor="name">Pool name</label>
                        <input
                            type="hidden"
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
                        <label htmlFor="Port">Host:Port</label>
                        <input
                            type="text"
                            id="port"
                            className="form-control mx-sm-4"
                            aria-describedby="algorithm"
                            placeholder="after stratum+tcp://"
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
export default Setup;
