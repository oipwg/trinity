import React, { useState, useEffect } from 'react';
import Navigation from '../nav/Navigation';
import './setup.css';

const Setup = () => {
    const [values, setValues] = useState(false);
    const [credentials, showCredentials] = useState(false);
    const [pool, showPool] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState([{credentials: false}]);

    useEffect(() => {
 
        // if(values) setup_Provider(values)
       
    },[userData]);

    function set_rental_provider(e) {
        e.preventDefault();
        const merge = ( ...objects ) => ( [...objects] );
        let target = e.target.options[e.target.selectedIndex].value

        if (!target) return

        let options = {
            providerName: target,
            provider: target,
            credentials: true,
            err: ''
        }
        // If more than {credentials: false} exist in userData array
        if (Object.keys(userData[0]).length > 1) {
            userData.map( prevState => {
                if (prevState.providerName !== target) {
                    let data = merge(options, prevState)
                    return setUserData(data)
                } 
            })
        } else {
            setUserData([options])
        }
    }

    function set_form_values(e) {
        e.preventDefault();
        const form = document.getElementsByClassName('wizard-form')[0]
        const form_inputs = form.elements
        let length = form_inputs.length
        let options = {}
        // let form_data = selector.options[selector.selectedIndex].value
        for (let i = 0; i < length; i++) {
            const el = form_inputs[i];
 
            if ( el.tagName === "SELECT" || el.tagName === "INPUT") {
                switch (el.id) {
                    case 'rental_provider':
                        options.rental_provider = el.options[el.selectedIndex].value
                    case 'key':
                        options.key = el.value
                    case 'secret':
                        options.secret = el.value
                }    
            }
        }
        form.reset();
        let sentData = {...userData[0], ...options}
        const merge = ( ...objects ) => ( [...objects] );
        // Adds values to state and adds callback to run the fetch process setup_Provider()
        console.log(merge(userData[1], sentData))
        // setUserData([{...userData[0],...options}])
        // setValues({...values,...options})
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
                case 'credintials':
                    responseData[property] = value
                case 'success':
                    responseData[property] = value
            }
            
            // if (data.err) {
            //     let errorType = data.err
            //     setError(data)
            // } else {
            //     credentials = true

            //     setUserData(data)
            // }
            
        }
        console.log(userData[0], responseData)
        // setUserData(responseData)
        // showPool(true)
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

    return (
        <section className="wizard">
            {console.log('values:', userData,Object.keys(userData))}
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
                                console.log(userData)
                                return (   
                                    <tr key={i} className="data-table-row">
                                        <td key={i}>{i}</td>
                                        {userData.provider && (
                                            <td key={provider}>{userData.err === "provider" ? userData.message : 
                                            userData.provider}</td>
                                        )}
                                        {userData.credentials && (
                                            <td key={credentials}>{!userData.credentials ? <span>&#10004;</span> :
                                            <i className="fas fa-thumbs-down"></i>}</td>
                                        )}
                                        {userData.pool && (
                                            <td key={pool}>{userData.err === "pool" ? userData.message : ''}</td> 
                                        )}
                                        {userData.success && (
                                            <td key={i}>{userData.success ? <span>&#10004;</span> : 
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
                    {console.log(userData[0].credentials)}
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
                    <div style={{height: userData[0].credentials ? '125px' : '0px'}} className="provider-credentials">
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
                <Pools poolBoolean={userData.pool}/>
                {/* End of pool information */}
                <button type="submit" className="btn-submit" onClick={set_form_values}>
                    Submit
                </button>
            </form>
        </section>
    );
};
const Pools = (props) => {
    return (
        
        <div className="pools">
            <div style={{height: props.poolBoolean === false ? '310px' : '0px' }} className="pool-add">
                <h4>Add A Pool</h4>
                <div className="form-inline">
                    <div className="form-groups">
                        <label className="my-1 mr-2">Type</label>
                        <select className="custom-select mx-sm-4">
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
                        <label htmlFor="Port">Host</label>
                        <input
                            type="text"
                            id="port"
                            className="form-control mx-sm-4"
                            aria-describedby="algorithm"
                            placeholder="Port"
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
                            placeholder="Wallet address"
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
