
import React, { useState, useEffect, useRef } from 'react';
import { API_URL, WEB_SOCKET_URL } from '../../../../../config.js';
import { updateDailyBudget, isNiceHashMinimum } from '../../../../actions/miningOperationsActions.js';
import ToggleSwitch from '../../../helpers/toggle/ToggleSwitch';
import { connect } from 'react-redux';
import MarketsNPools from '../../../settings/prefrences/merc/MercMode'
import { isEqual } from 'lodash'

const MiningOperations = (props) => {
    const socket = useRef(null)
    const user_id = useRef(null)

    function connectSocket() {
        socket.current = new WebSocket(WEB_SOCKET_URL);
        socket.current.onclose = (e) => {
            console.log('onClose:')
            if (socket.current) {
                console.log('Going to try and connect again')
                connectSocket()
            }
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
            socket.current = false
        }
    }, [])

    if (socket.current) {
        socket.current.onmessage = (e) => {
            if (e.data === '__ping__') {
                console.log('Still alive')
                socket.current.send(JSON.stringify({ keepAlive: true }));
            } else {
                let message = JSON.parse(e.data)
                if (message.userId === user_id.current) {
                    processReturnData(message)
                }
            }
        }
    }


    const [showSettingaModal, setShowSettingsModal] = useState(false)
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
        token: '',
        message: [],
        update: false,
        CostOfRentalBtc: '',
        userId: '',
        mining: false
    });

    let {
        targetMargin, profitReinvestment, updateUnsold, dailyBudget, autoRent, spot, alwaysMineXPercent, autoTrade,
        morphie, supportedExchange, Xpercent, token, mining
    } = miningOperations

    useEffect(() => {

        if (props.user && props.profile) {
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

            props.dispatch(updateDailyBudget({ ...profile, userId: props.user._id, profile_id: props.profile._id }))
            setOperations({ ...miningOperations, ...profile })
            user_id.current = props.user._id

        } else {
            setOperations({
                targetMargin: 0,
                profitReinvestment: 0,
                updateUnsold: '0',
                dailyBudget: dailyBudget,
                autoRent: false,
                spot: false,
                alwaysMineXPercent: true,
                autoTrade: false,
                morphie: false,
                supportedExchange: false,
                Xpercent: 0,
                token: '',
                message: [],
                update: false,
                CostOfRentalBtc: '',
                userId: '',
                mining: false
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
            setOperations({ ...miningOperations, message: [], update: false, mining: false })
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
            } else if (key === 'mining') {
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
            console.log('Response data from renting:', data)
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



    // When slider is clicked to switch it checks to make sure inputs have values in them first.
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
                            <p>Mining</p>
                            <svg viewBox="0 0 134 134" width="50" height="50">
                                <style type="text/css">{
                                    ".st0{fill:url(#SVGID_1_);}" +
                                    ".st1{fill:url(#SVGID_2_);}" +
                                    ".st2{fill:url(#SVGID_3_);}" +
                                    ".st3{fill:url(#green-glow_1_);}" +
                                    ".st4{fill:#FF3600;}" +
                                    ".st5{fill:url(#SVGID_4_);}" +
                                    ".st6{fill:url(#SVGID_5_);}" +
                                    ".st7{fill:url(#bulb-top-hightlight_1_);}"
                                }</style>
                                <g id="outter-shadow">
                                    <radialGradient id="SVGID_1_" cx="-475.6171" cy="1244.5013" r="51.42" fx="-507.3624" fy="1273.3612" gradientTransform="matrix(-0.5452 0.8383 0.9221 0.5997 -1341.6274 -308.4312)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#828282" />
                                        <stop offset="1" stopColor="#000000" />
                                    </radialGradient>
                                    <path className="st0" d="M87.9,28.3c-21.4-11.6-48.1-3.6-59.6,17.8s-3.6,48.1,17.8,59.6s48.1,3.6,59.6-17.8c0,0,0,0,0,0
                             C117.2,66.5,109.3,39.9,87.9,28.3z M50.1,98.3C32.8,89,26.4,67.4,35.7,50.2s30.9-23.7,48.1-14.4c17.3,9.3,23.7,30.9,14.4,48.1
                             C88.9,101.2,67.4,107.6,50.1,98.3L50.1,98.3z"/>
                                </g>
                                <g id="ring-inner-shadow">
                                    <radialGradient id="SVGID_2_" cx="239.8466" cy="487.8054" r="42.95" fx="239.8508" fy="487.8011" gradientTransform="matrix(0.8115 0.5844 0.5844 -0.8115 -412.775 343.5056)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#828282" />
                                        <stop offset="1" stopColor="#000000" />
                                    </radialGradient>
                                    <path className="st1" d="M88.2,37.5c-16.3-11.7-39-8-50.7,8.2s-8,39,8.2,50.7s39,8,50.7-8.2c0,0,0,0,0,0
                             C108.2,71.9,104.5,49.2,88.2,37.5z M48.7,92.4c-14.1-10.1-17.2-29.7-7.1-43.8s29.7-17.2,43.8-7.1s17.2,29.7,7.1,43.8c0,0,0,0,0,0
                             C82.3,99.4,62.7,102.6,48.7,92.4z"/>
                                </g>
                                <g id="green-bulb">
                                    <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="66.3183" y1="43.26" x2="67.6683" y2="94.07" gradientTransform="matrix(1 0 0 -1 -4.134885e-03 135.9977)">
                                        <stop offset="0" stopColor="#79AA00" />
                                        <stop offset="1" stopColor="#307F00" />
                                    </linearGradient>
                                    <circle className="st2" cx="67" cy="67" r="31.3" />

                                    <radialGradient id="green-glow_1_" cx="67" cy="69" r="41.76" gradientTransform="matrix(1 0 0 -1 0 136)" gradientUnits="userSpaceOnUse">
                                        <stop  offset="0" stopColor="#79E100"/>
                                        <stop  offset="0.3612" stopColor="#4DED00" stopOpacity="0.6966"/>
                                        <stop  offset="0.7864" stopColor="#1FFA00" stopOpacity="0.3394"/>
                                        <stop  offset="1" stopColor="#0DFF00" stopOpacity="0.16"/>
                                    </radialGradient>
                                    <circle className={mining && autoRent ? "green-glow st3 ledBulb" : "green-glow st3"} cx="67" cy="67" r="41.8" />
                                </g>
                                <g className="red-bulb" style={{display: mining && autoRent ? 'none' : 'block'}}>
                                    <circle className="st4" cx="67" cy="67" r="31.3" />
                                    <radialGradient id="SVGID_4_" cx="66.9954" cy="69.0035" r="31.3547" gradientTransform="matrix(1 0 0 -1 8.765546e-03 136.0075)" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#FF8800" />
                                        <stop offset="0.19" stopColor="#FF7A00" stopOpacity="0.83" />
                                        <stop offset="0.62" stopColor="#FF5600" stopOpacity="0.39" />
                                        <stop offset="1" stopColor="#FF3600" stopOpacity="0" />
                                    </radialGradient>
                                    <circle className="st5" cx="67" cy="67" r="31.4" />
                                </g>
                                <g id="bulb-bottom-highlight">
                                    <linearGradient id="SVGID_5_" gradientUnits="userSpaceOnUse" x1="67" y1="39.2391" x2="67" y2="51.1" gradientTransform="matrix(1 0 0 -1 0 136)">
                                        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
                                        <stop offset="1" stopColor="#FDF0EC" stopOpacity="0" />
                                    </linearGradient>
                                    <path className="st6" d="M89.8,84.9c-8.8,12.6-26.1,15.6-38.7,6.8c-2.7-1.9-5-4.2-6.8-6.8H89.8z" />
                                </g>
                                <linearGradient id="bulb-top-hightlight_1_" gradientUnits="userSpaceOnUse" x1="66.91" y1="74.22" x2="66.91" y2="98.98" gradientTransform="matrix(1 0 0 -1 0 136)">
                                    <stop offset="0" stopColor="#FDF0EC" stopOpacity="0" />
                                    <stop offset="0.11" stopColor="#FDF0ED" stopOpacity="2.000000e-02" />
                                    <stop offset="0.25" stopColor="#FDF2EE" stopOpacity="9.000000e-02" />
                                    <stop offset="0.42" stopColor="#FDF4F1" stopOpacity="0.2" />
                                    <stop offset="0.59" stopColor="#FEF7F4" stopOpacity="0.35" />
                                    <stop offset="0.79" stopColor="#FEFAF9" stopOpacity="0.55" />
                                    <stop offset="0.98" stopColor="#FFFFFF" stopOpacity="0.78" />
                                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.8" />
                                </linearGradient>
                                <ellipse id="bulb-top-hightlight" className="st7" cx="66.9" cy="49.4" rx="21" ry="12.4" />
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
                                <PercentModal miningOperations={miningOperations} state={props} />
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
    let token = props.miningOperations.token

    const modalOpen = () => {
        if (props.state.percentModal === 'open' && token !== 'RVN') {
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
                    onClick={() => { props.state.dispatch(isNiceHashMinimum(0, 0, 'close')) }}>
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
                        onClick={() => { props.state.dispatch(isNiceHashMinimum(0, 0, 'close')) }}>OK, THANKS</button>
                </div>
            </div>
            <span className="error-arrow"></span>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        percentModal: state.percentModalReducer.percentModalopen,
        user: state.auth.user,
        address: state.account.wallet,
        dailyBudget: state.miningOperationsReducer.dailyBudget
    };
};

export default connect(mapStateToProps)(MiningOperations);
