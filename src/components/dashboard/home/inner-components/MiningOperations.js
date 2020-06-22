
import React, { useState, useEffect, useRef } from 'react';
import { API_URL, WEB_SOCKET_URL } from '../../../../../config.js';
import { updateDailyBudget, isNiceHashMinimum } from '../../../../actions/miningOperationsActions.js';
import ToggleSwitch from '../../../helpers/toggle/ToggleSwitch';
import { connect } from 'react-redux';
import MarketsNPools from '../../../settings/prefrences/merc/MercMode'
import { isEqual } from 'lodash'

const MiningOperations = (props) => {
    const socket = useRef(null)

    function connectSocket(){
        socket.current = new WebSocket(WEB_SOCKET_URL);
        socket.current.onclose = (e) => {
            console.log('onClose:')
        }
        socket.current.onopen = (e) => {
            socket.current.send(JSON.stringify({ action: 'connect' }));
        };
    }

    useEffect(() => {
        connectSocket()
        return () => {
            // When MiningOperations unmounts it wont let the timer update and run to prevent memory leaks
            socket.current.close()
        }
    }, [])

    if (socket.current) {
        socket.current.onmessage = (e) => {
            if (e.data === '__ping__') {
                console.log('Still alive')
                socket.current.send(JSON.stringify({ keepAlive: true }));
            } else {
                let message = JSON.parse(e.data)
                if(message.userId === props.user._id) {
                    processReturnData(message)
                }
            }
        }
    }



    const [err, setError] = useState({ autoRent: false, autoTrade: false })
    const [miningOperations, setOperations] = useState({
        targetMargin: 0,
        profitReinvestment: 0,
        updateUnsold: '',
        dailyBudget: 0,
        autoRent: false,
        spot: false,
        alwaysMineXPercent: false,
        autoTrade: false,
        morphie: false,
        supportedExchange: false,
        Xpercent: 15,
        token: 'FLO',
        message: [],
        update: false,
        CostOfRentalBtc: '',
        spartanbot: {},
        userId: ''
    });


    const [showSettingaModal, setShowSettingsModal] = useState(false)
    let {
        targetMargin,
        profitReinvestment,
        updateUnsold,
        dailyBudget,
        autoRent,
        spot,
        alwaysMineXPercent,
        autoTrade,
        morphie,
        supportedExchange,
        Xpercent
    } = miningOperations

    useEffect(() => {


        if (props.user && props.profile) {
            props.dispatch(updateDailyBudget({...miningOperations, userId: props.user._id, profile_id: props.profile._id}))

            const {
                targetMargin, profitReinvestment, updateUnsold, dailyBudget, autoRent, autoTrade, token, name, _id
            } = props.profile

            let profile = {
                targetMargin: targetMargin,
                profitReinvestment: profitReinvestment,
                updateUnsold: updateUnsold,
                dailyBudget: dailyBudget,
                autoRent: autoRent.on,
                spot: autoRent.mode.spot,
                alwaysMineXPercent: autoRent.mode.alwaysMineXPercent.on,
                Xpercent: autoRent.mode.alwaysMineXPercent.Xpercent,
                autoTrade: autoTrade.on,
                morphie: autoTrade.mode.morphie,
                supportedExchange: autoTrade.mode.supportedExchanges,
                token: token,
                name,
                profile_id: _id,
                userId: props.user._id
            }
            
            setOperations({...miningOperations, ...profile })

            // setError('')

        } else {
            setOperations({
                targetMargin: 1,
                profitReinvestment: 1,
                updateUnsold: '1',
                dailyBudget: dailyBudget,
                autoRent: false,
                spot: false,
                alwaysMineXPercent: true,
                autoTrade: false,
                morphie: false,
                supportedExchange: false,
                Xpercent: 15,
                token: 'FLO',
                message: [],
                update: false,
                CostOfRentalBtc: '',
                userId: '',
                spartanbot: JSON.parse( sessionStorage.getItem('spartanbot') )
            })
        }
    }, [props.profile, props.address])

    useEffect((prevProf = props.profile) => {
        let formatedState = {
            profile: {
                autoRent: {
                    mode: {
                        spot,
                        alwaysMineXPercent: {
                            on: alwaysMineXPercent,
                            Xpercent,
                        }
                    },
                    on: autoRent,
                },
                autoTrade: {
                    mode: {
                        morphie,
                        supportedExchanges: supportedExchange
                    },
                    on: autoTrade
                },
                targetMargin,
                profitReinvestment,
                updateUnsold,
                dailyBudget,
            }
        }
        let profile = { ...props.profile, ...formatedState.profile }

        if (isEqual(prevProf, profile)) {
            return;
        }

        props.updateProfile(profile)

        if (miningOperations.autoRent) {
            // If update has a value of true it removes back to undefined to be updated once again on the backend
            setOperations({ ...miningOperations, message: [], update: false })
            rent(miningOperations)
        }
    }, [autoRent]);

    useEffect(() => {
        if (!props.dailyBudget) return
        setOperations({ ...miningOperations, dailyBudget: props.dailyBudget })
    }, [props.dailyBudget])

    const processReturnData = (data) => {
        let newValues = {}

        for (let key in data) {
            if (key === 'Xpercent') {
                newValues[key] = Number(data[key])
            } else if (key === 'message') {
                let message = miningOperations.message.concat(data[key])
                newValues[key] = message
            } else if (key === 'update') {
                newValues[key] = data[key]
            } else if (key === 'autoRent') {
                newValues[key] = data[key]
            } else if (key === 'db') {
                for (let key in data.db) {
                    newValues[key] = data.db[key]
                }
            }
        }
        setOperations({ ...miningOperations, ...newValues })
    }

    const rent = (options) => {
        options.to_do = 'rent'
        options.userId = props.user._id
        options.message = []
        options.update = false

        fetch(API_URL + '/rent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(options)
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log('data:', data)
        }).catch((err) => {
            console.log(err)
        });
    }

    // const trade = (profileID) => {
    //     console.log(profileID)

    //     fetch(API_URL+'/auto-trade/on/'+profileID, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'x-auth-token': localStorage.getItem('token')
    //         },
    //     }).then((response) => {
    //         return response.json();
    //     })
    //       .then((data) => {
    //         console.log(data);
    //     }).catch((err)=> {
    //           console.log(err)
    //     });
    // }




    const checkInputsAndRent = (e, slider) => {
        let profile = {}

        for (let key in miningOperations) {
            switch (key) {
                case 'targetMargin':
                    if (miningOperations[key] === '')
                        return setError({ targetMargin: true })
                    break;
                case 'profitReinvestment':
                    if (miningOperations[key] === '')
                        return setError({ profitReinvestment: true })
                    break;
                case 'updateUnsold':
                    if (miningOperations[key] === '')
                        return setError({ updateUnsold: true })
                    break;
                case 'autoRent':
                    if (slider === 'autoRent') {
                        // If neither radios are checked
                        if (miningOperations.spot === miningOperations.alwaysMineXPercent) {
                            return setError({ autoRent: true })
                        }
                        let options = { ...miningOperations, autoRent: !autoRent, autoTrade: false }
                        console.log('options:', options)
                        setOperations(options)
                    }
                    break;
                case 'autoTrade':
                    if (slider === 'autoTrade') {
                        // If neither radios are checked
                        if (miningOperations.morphie === miningOperations.supportedExchange) {
                            return setError({ autoTrade: true })
                        }
                        setOperations({ ...miningOperations, autoRent: false, autoTrade: !autoTrade })
                    }
            }
        }
    }


    const updateInputs = (e) => {
        const targetElem = e.target.id

        switch (targetElem) {
            case "targetMargin":
                if (err.targetMargin) setError({ targetMargin: false })
                props.dispatch(updateDailyBudget({ ...miningOperations, targetMargin: e.target.value }))
                setOperations({ ...miningOperations, targetMargin: e.target.value })
                break;
            case "profitReinvestment":
                if (err.profitReinvestment) setError({ profitReinvestment: false })
                props.dispatch(updateDailyBudget({ ...miningOperations, profitReinvestment: e.target.value }))
                setOperations({ ...miningOperations, profitReinvestment: e.target.value })
                break;
            case "updateUnsold":
                if (err.updateUnsold) setError({ updateUnsold: false })
                setOperations({ ...miningOperations, updateUnsold: e.target.value })
                break;
            case "autoRent":
                checkInputsAndRent(e, targetElem)
                break;
            case "spot":
                if (err.autoRent) setError({ autoRent: false })
                setOperations({ ...miningOperations, spot: true, alwaysMineXPercent: false })
                break;
            case "alwaysMineXPercent":
                if (err.autoRent) setError({ autoRent: false })
                setOperations({ ...miningOperations, alwaysMineXPercent: true, spot: false })
                break;
            case "autoTrade":
                checkInputsAndRent(e, targetElem)
                break;
            case "morphie":
                if (err.autoTrade) setError({ autoTrade: false })
                setOperations({ ...miningOperations, morphie: true, supportedExchange: false })
                break;
            case "supportedExchange":
                if (err.autoTrade) setError({ autoTrade: false })
                setOperations({ ...miningOperations, supportedExchange: true, morphie: false })
        }
    }


    const updatePercent = e => {
        let value = e.target.value
        console.log('value:', value)
        // props.dispatch(isNiceHashMinimum(value, token))
        props.dispatch(updateDailyBudget({ ...miningOperations, Xpercent: value }, 'upDateNiceHashMinimum'))
        setOperations({ ...miningOperations, Xpercent: value })
    }
    const showPercentInput = () => {
        let elem = document.getElementsByClassName('percent-input-container')[0]
        let pos = elem.style.transform
        if (pos === '') {
            elem.style.transform = 'translate(0px)'
        } else {
            elem.style = ''
        }
    }

    return (
        <>
            {showSettingaModal && <MarketsNPools handleClick={() => setShowSettingsModal(!showSettingaModal)} />}
            <div className="card mining-operation">
                <div className="card-header">
                    <div className="header-container">
                        <p>Mining Operations</p>
                        <div className="table-container message-field" style={{ height: miningOperations.message.length ? '134px' : '55px' }}>
                            <table className="table">
                                <thead id="mining-op-tableHeader">
                                    <tr>
                                        <th id="updateMessage" scope="col">Messages</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        miningOperations.message.map((message, i) => {
                                            return (
                                                <tr key={i} className="data-table-row">
                                                    <td>{i + 1}</td><td className="messages">{message}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="mining-operation-inputs">
                        <div className="target-margin-container">
                            <label htmlFor="basic-url">Target Margin</label>
                            <div className="input-group">
                                <input type="text" id="targetMargin" className="form-control" aria-label="Target margin reinvest"
                                    onChange={(e) => { updateInputs(e) }} maxLength="2" value={targetMargin} />
                                <div className="input-group-append">
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                            <div style={{ transform: err.targetMargin ? 'scale(1)' : 'scale(0)' }} className="error-dialog">
                                <span className="error-arrow"></span>
                                <p>Input a percentage!</p>
                            </div>
                        </div>
                        <div className="profit-reinvestment-container">
                            <label htmlFor="basic-url">Profit Reinvestment</label>
                            <div className="input-group">
                                <input type="text" id="profitReinvestment" className="form-control" aria-label="Target margin reinvest"
                                    onChange={(e) => { updateInputs(e) }} maxLength="2" value={profitReinvestment} />
                                <div className="input-group-append">
                                    <span className="input-group-text">%</span>
                                </div>
                            </div>
                            <div style={{ transform: err.profitReinvestment ? 'scale(1)' : 'scale(0)' }} className="error-dialog">
                                <span className="error-arrow"></span>
                                <p>Input a percentage!</p>
                            </div>
                        </div>
                        <div className="unusoled-offers-container">
                            <label htmlFor="basic-url">Update Unsold Offers</label>
                            <div className="input-group">
                                <select className="custom-select" id="updateUnsold" onChange={(e) => { updateInputs(e) }}
                                    value={updateUnsold}>
                                    <option default>Hourly</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                            <div style={{ transform: err.updateUnsold ? 'scale(1)' : 'scale(0)' }} className="error-dialog">
                                <span className="error-arrow"></span>
                                <p>Choose an interval!</p>
                            </div>
                        </div>
                        <div className="daily-budget-container">
                            <label htmlFor="basic-url">Daily Budget USD</label>
                            <div className="input-group">
                                <input type="text" className="form-control" id="dailyBudget" aria-label="Daily budget"
                                    onChange={(e) => { updateInputs(e) }} value={miningOperations.dailyBudget} />
                                <div className="input-group-append">
                                    <span className="daily-budget-text">Edit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AUTO RENTING CONTAINER */}
                    <div className="automatic-renting-container">
                        <span className="renting-light-container">
                            <p>RENTING</p>
                            {/* <svg viewBox="0 0 32 32" width="22" height="22">
                        <defs>
                            <radialGradient id="radial-gradient" cx="16" cy="16" r="16" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#abff00"/>
                            <stop offset="0.12" stopColor="#a4fa00"/>
                            <stop offset="0.29" stopColor="#90ee00"/>
                            <stop offset="0.49" stopColor="#6fd900"/>
                            <stop offset="0.73" stopColor="#41bc00"/>
                            <stop offset="0.98" stopColor="#079700"/>
                            <stop offset="1" stopColor="#029400"/>
                        </radialGradient>
                        </defs>
                        <circle cx="16" cy="16" r="16" className={miningOperations.autoRent ? 'ledBulb' : 'hideLed'} fill=" url(#radial-gradient)"/>
                        <path d="M16,1A15,15,0,1,1,1,16,15,15,0,0,1,16,1m0-1A16,16,0,1,0,32,16,16,16,0,0,0,16,0Z" fill="#444"/>
                        </svg> */}
                            <svg viewBox="0 0 88 88" width="30" height="30">
                                <defs>
                                    <radialGradient id="radial-gradient" cx="29.31" cy="20.41" fx="-2.4352928907866698" fy="49.26989691412602" r="51.42" gradientTransform="translate(77.07 3.92) rotate(123.04) scale(1 1.1)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#828282" />
                                        <stop offset="1" />
                                    </radialGradient>
                                    <radialGradient id="radial-gradient-2" cx="56.11" cy="60.95" fx="56.114242650427514" fy="60.94565712206986" r="42.95" gradientTransform="translate(34.01 -17.42) rotate(35.76)" href="#radial-gradient" />
                                    <linearGradient id="linear-gradient" x1="43.32" y1="69.74" x2="44.67" y2="18.93" gradientTransform="translate(30.52 -16.75) rotate(32.49)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#79aa00" />
                                        <stop offset="1" stopColor="#307f00" />
                                    </linearGradient>
                                    <radialGradient id="radial-gradient-3" cx="44" cy="44" r="41.76" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#79aa00" />
                                        <stop offset="0.12" stopColor="#72b000" stopOpacity="0.93" />
                                        <stop offset="0.33" stopColor="#5fbe00" stopOpacity="0.76" />
                                        <stop offset="0.6" stopColor="#41d600" stopOpacity="0.48" />
                                        <stop offset="0.93" stopColor="#17f700" stopOpacity="0.09" />
                                        <stop offset="1" stopColor="#0dff00" stopOpacity="0" />
                                    </radialGradient>
                                    <radialGradient id="radial-gradient-4" cx="44" cy="44" r="31.35" gradientTransform="translate(7.64 -6.49) rotate(9.24)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#f80" />
                                        <stop offset="0.19" stopColor="#ff7a00" stopOpacity="0.83" />
                                        <stop offset="0.62" stopColor="#ff5600" stopOpacity="0.39" />
                                        <stop offset="1" stopColor="#ff3600" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="linear-gradient-2" x1="44" y1="73.76" x2="44" y2="61.9" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                                        <stop offset="1" stopColor="#fdf0ec" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="linear-gradient-3" x1="43.91" y1="38.78" x2="43.91" y2="14.02" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#fdf0ec" stopOpacity="0" />
                                        <stop offset="0.11" stopColor="#fdf0ed" stopOpacity="0.02" />
                                        <stop offset="0.25" stopColor="#fdf2ee" stopOpacity="0.09" />
                                        <stop offset="0.42" stopColor="#fdf4f1" stopOpacity="0.2" />
                                        <stop offset="0.59" stopColor="#fef7f4" stopOpacity="0.35" />
                                        <stop offset="0.79" stopColor="#fefaf9" stopOpacity="0.55" />
                                        <stop offset="0.98" stopColor="#fff" stopOpacity="0.78" />
                                        <stop offset="1" stopColor="#fff" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>
                                <g id="outter-shadow">
                                    <path d="M64.92,5.3A44,44,0,1,0,82.7,64.92,44,44,0,0,0,64.92,5.3Zm-37.82,70A35.53,35.53,0,1,1,75.25,60.9,35.54,35.54,0,0,1,27.1,75.25Z" fill=" url(#radial-gradient)" />
                                </g>
                                <g id="ring-inner-shadow">
                                    <path d="M65.23,14.52a36.33,36.33,0,1,0,8.25,50.71A36.34,36.34,0,0,0,65.23,14.52ZM25.68,69.44a31.35,31.35,0,1,1,43.76-7.12A31.36,31.36,0,0,1,25.68,69.44Z" fill=" url(#radial-gradient-2)" />
                                </g>
                                <g id="green-bulb">
                                    <circle cx="44" cy="44" r="31.35" transform="translate(-16.75 30.52) rotate(-32.49)" fill=" url(#linear-gradient)" />
                                    <circle id="green-glow" cx="44" cy="44" r="41.76" fill=" url(#radial-gradient-3)" />
                                </g>
                                <g id="red-bulb">
                                    <circle cx="44" cy="44" r="31.35" transform="translate(-16.75 30.52) rotate(-32.49)" fill=" #ff3600" />
                                    <circle cx="44" cy="44" r="31.35" transform="translate(-6.49 7.64) rotate(-9.24)" fill=" url(#radial-gradient-4)" />
                                </g>
                                <g id="bulb-bottom-highlight">
                                    <path d="M66.77,61.9a27.79,27.79,0,0,1-45.54,0Z" fill=" url(#linear-gradient-2)" />
                                </g>
                                <ellipse id="bulb-top-hightlight" cx="43.91" cy="26.4" rx="20.96" ry="12.38" fill=" url(#linear-gradient-3)" />
                            </svg>
                        </span>
                        <ToggleSwitch
                            handleChange={(e) => { updateInputs(e) }}
                            id={"autoRent"}
                            htmlFor={"autoRent"}
                            isOn={autoRent} />

                        <div className="automatic-renting-content">
                            <h5>Automatic Renting</h5>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="spot"
                                    value={spot}
                                    name="auto-rent"
                                    checked={miningOperations.spot ? true : false}
                                    onChange={(e) => {
                                        updateInputs(e)
                                    }} />
                                <label className="form-check-label" htmlFor="spotProfitable">
                                    Mine only when spot profitable
                            </label>
                            </div>
                            <div className="percent-container">
                                <PercentModal miningOperations={miningOperations} state={props}/>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" id="alwaysMineXPercent"
                                        value={alwaysMineXPercent}
                                        name="auto-rent"
                                        checked={miningOperations.alwaysMineXPercent ? true : false}
                                        onChange={(e) => { updateInputs(e) }} />
                                    <label className="form-check-label" htmlFor="alwaysMineXPercent">
                                        Always mine {Xpercent}% of the network
                                </label>
                                </div>
                                <div className="percent-input-container" >
                                    <input type="text" className="form-control percent-field" id="Xpercent"
                                        required placeholder="0" onChange={(e) => { updatePercent(e) }} maxLength="5"
                                        value={Xpercent}
                                    />
                                    <span>%</span>
                                    <button className="edit-percent-btn" onClick={showPercentInput}>edit</button>
                                </div>
                            </div>
                            <div style={{ transform: err.autoRent ? 'scale(1)' : 'scale(0)' }} className="error-dialog">
                                <span className="error-arrow"></span>
                                <p>Need at least one checked before renting!</p>
                            </div>
                            {/* Select Rental Markets & Mining Pool */}
                            <button onClick={() => setShowSettingsModal(!showSettingaModal)} className="select-markets-pools">Select Rental Markets & Mining Pools</button>

                            <br />
                            {/* AUTO TRADING */}
                            <h5>Automatic Trading</h5>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="morphie"
                                    value={morphie}
                                    // checked={morphie}
                                    checked={miningOperations.morphie ? true : false}
                                    name="auto-trading"
                                    onChange={(e) => { updateInputs(e) }} />
                                <label className="form-check-label" htmlFor="morphie">
                                    Prefer the Morphie DEX
                            </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="supportedExchange"
                                    // value={supportedExchange}
                                    name="auto-trading"
                                    checked={miningOperations.supportedExchange ? true : false}
                                    onChange={(e) => { updateInputs(e) }} />
                                <label className="form-check-label" htmlFor="supportedExchange">
                                    Supported exchanges
                            </label>
                            </div>
                            <div style={{ transform: err.autoTrade ? 'scale(1)' : 'scale(0)' }} className="error-dialog">
                                <span className="error-arrow"></span>
                                <p>Need at least one checked before renting!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const PercentModal = (props) => {
    let percent = props.miningOperations.Xpercent
    // let modalOpen = props.state.percentModal
    const modalOpen = () => {
        if(props.state.percentModal === 'open') {
            return {
                opacity: 1,
                transform: 'scale(1)'
            }
        } else {
            return {
                opacity: 0,
                transform: 'scale(0)'
            }
        }
    }

    return (
        <div className="percent-modal-container" style={modalOpen()}>
            <div className="percent-modal">
                <header className="percent-header"></header>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                onClick={()=> { props.state.dispatch(isNiceHashMinimum(0,0,'close'))} }>
                    <span aria-hidden="true" className="white-text">&times;</span>
                </button>
                <div className="content-wrapper">
                    <i className="fa fa-bell-o" aria-hidden="true"></i>
                    <p>Your <span>{percent}%</span> is too low for Nicehash's minimum, so MiningRigRentals will be used by default. 
                    If you would like to have Spartan also consider the Nicehash rental provider, please increase percentage.</p>
                </div>
                
                <div className="modal-footer flex-center">
                    <button className="btn btn-primary">CHANGE IT FOR ME
                    {/* <i className="far fa-gem ml-1 white-text"></i> */}
                    </button>
                    <button type="button" className="btn btn-outline-danger" data-dismiss="modal"
                    onClick={()=> { props.state.dispatch(isNiceHashMinimum(0,0,'close'))} }>OK, THANKS</button>
                </div>
            </div>
            <span className="error-arrow"></span>
        </div>
    )
}

const mapStateToProps = state => {
    
    console.log('state:', state)
    return {
        percentModal: state.percentModalReducer.percentModalopen,
        user: state.auth.user,
        address: state.account.wallet,
        dailyBudget: state.miningOperationsReducer.dailyBudget
    };
};

export default connect(mapStateToProps)(MiningOperations);
