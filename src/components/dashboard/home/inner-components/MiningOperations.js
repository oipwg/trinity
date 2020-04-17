import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../../../config.js';
import ToggleSwitch from '../../../helpers/toggle/ToggleSwitch';
import MarketsNPools from '../../../settings/prefrences/merc/MercMode'
import {isEqual} from 'lodash'

const MiningOperations = (props) => {

    const [err, setError] = useState({autoRent: false, autoTrade: false})
    const [miningOperations, setOperations] = useState({
            targetMargin: '',
            profitReinvestment:'',
            updateUnsold: '',
            dailyBudget: '',
            autoRent: false,
            spot: false,
            alwaysMineXPercent: false,
            autoTrade: false,
            morphie: false,
            supportedExchange: false,
            Xpercent: 0,
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
            Xpercent,
            } = miningOperations


    useEffect(() => {
        if(props.profile){

            let {
                targetMargin,
                profitReinvestment,
                updateUnsold,
                dailyBudget,
                autoRent,
                autoTrade,
            } = props.profile


            setOperations({
                targetMargin,
                profitReinvestment,
                updateUnsold,
                dailyBudget,
                autoRent: autoRent.on,
                spot: autoRent.mode.spot,
                alwaysMineXPercent: autoRent.mode.alwaysMineXPercent.on,
                Xpercent: autoRent.mode.alwaysMineXPercent.Xpercent,
                autoTrade: autoTrade.on,
                morphie: autoTrade.mode.morphie,
                supportedExchange: autoTrade.mode.supportedExchanges
            })
            setError('')

        }
        else setOperations({
            targetMargin: '',
            profitReinvestment:'',
            updateUnsold: '',
            dailyBudget: '',
            autoRent: false,
            spot: false,
            alwaysMineXPercent: false,
            autoTrade: false,
            morphie: false,
            supportedExchange: false,
            Xpercent: 0
        })
    }, [props.profile])



    useEffect((prevProf = props.profile) => {
        // rent(miningOperations)

        let formatedState= {
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
                on: autoTrade },
            targetMargin,
            profitReinvestment,
            updateUnsold,
            dailyBudget,
            }
        }
        let profile = {...props.profile, ...formatedState.profile}

        if(isEqual(prevProf, profile)){
            return;
        }

        props.updateProfile(profile)

    },[autoRent, autoTrade ])

    // const toggleSlider = (e) => {
    //     const regex = /\d+/i;
    //     const current = e.target.parentNode;
    //     const sliders = document.querySelectorAll('.slider-container')
    //     // let targetPos = current.style.transform.match(regex)[0]

    //     let obj = {}
    //     let i = 0
        
    //     while(i < 2) {
    //         let slider = sliders[i]
    //         let pos = slider.style.transform.match(regex)[0]
    //         // Current slider clicked
    //         if (current === slider) {
    //             let target = slider.childNodes[2].id
                
    //             if (pos === "50") {
    //                 obj[target] = false
    //                 slider.style.transform = "translateX(0px)"
    //             }
    //             if( pos === "0") {
    //                 obj[target] = true
    //                 slider.style.transform = "translateX(50px)"
    //             }
    //         // Everything but current slider 
    //         } else {
    //             let target = slider.childNodes[2].id
    //             obj[target] = false
    //             // If wanted to toggle back and forth 
    //             // slider.style.transform = targetPos === "50" ? "translateX(50px)" : "translateX(0px)"; 
    //             slider.style.transform = "translateX(0px)";
    //         }
    //         i++
    //     }
    //     setOperations({...miningOperations, ...obj})
    // }

    const rent = (profile) => {
        return
        fetch(API_URL+'/rent', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
            },
            body: JSON.stringify(profile),
        }).then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
          }).catch((err)=> {
              console.log(err)
          });
    }

    const checkInputsAndRent = (e, slider) => {
        let profile = {}
       
        for (let key in miningOperations) {
            switch (key) {
                case 'targetMargin':
                    if (miningOperations[key] === '')
                        return setError({targetMargin: true})
                    break;
                case 'profitReinvestment':
                    if (miningOperations[key] === '') 
                        return setError({profitReinvestment: true})
                    break;
                case 'updateUnsold':
                    if (miningOperations[key] === '') 
                        return setError({updateUnsold: true})
                    break;
                case 'dailyBudget':
                    if (miningOperations[key] === '') 
                        return setError({dailyBudget: true})
                    break;
                case 'autoRent':
                    if (slider === 'autoRent') {
                        if (miningOperations.spot === miningOperations.alwaysMineXPercent) {
                            // If neither radios are checked
                            return setError({autoRent: true})
                        }
                        setOperations({...miningOperations, autoRent: !autoRent, autoTrade: false})

                    }
                    break;
                case 'autoTrade':
                    if (slider === 'autoTrade') {
                        if (miningOperations.morphie === miningOperations.supportedExchange) {
                            // If neither radios are checked
                            return setError({autoTrade: true})
                        }
                        setOperations({...miningOperations, autoRent: false, autoTrade: !autoTrade})

                    }
                    break;
            }
        }
    }


    const updateInputs = (e) => {

        const targetElem = e.target.id

        
        switch ( targetElem ) {
            case "targetMargin":
                if (err.targetMargin) setError({targetMargin: false})
                setOperations({...miningOperations, targetMargin: e.target.value})
                break;
            case "profitReinvestment":
                if (err.profitReinvestment) setError({profitReinvestment: false})
                setOperations({...miningOperations, profitReinvestment: e.target.value})
                break;
            case "updateUnsold":
                if (err.updateUnsold) setError({updateUnsold: false})
                setOperations({...miningOperations, updateUnsold: e.target.value})
                break;
            case "dailyBudget":
                if (err.dailyBudget) setError({dailyBudget: false})
                    setOperations({...miningOperations, dailyBudget: e.target.value })
                break;
            case "autoRent":
                checkInputsAndRent(e, targetElem)
                break;
            case "spot":
                if (err.autoRent) setError({autoRent: false})
                setOperations({...miningOperations, spot: true, alwaysMineXPercent: false})
                break;
            case "alwaysMineXPercent":
                if (err.autoRent) setError({autoRent: false})
                setOperations({...miningOperations, alwaysMineXPercent: true, spot: false})
                break;
            case "autoTrade":
                checkInputsAndRent(e,targetElem)
                break;
            case "morphie":
                if (err.autoTrade) setError({autoTrade: false})
                setOperations({...miningOperations, morphie: true, supportedExhange: false})
                break;
            case "supportedExchange":
                if (err.autoTrade) setError({autoTrade: false})
                setOperations({...miningOperations, supportedExchange: true, morphie: false})
        }
    }

    const editPercent = e => {
        let value = e.target.value
        setOperations({...miningOperations, Xpercent: value})
    }
    
    return (
        <>
        {showSettingaModal 
            && 
            <MarketsNPools handleClick={() => setShowSettingsModal(!showSettingaModal)}/>
        }
        <div className="card mining-operation">
            <div className="card-header">Mining Operations</div>
            <div className="card-body">
                <div className="mining-operation-inputs">
                    <div className="target-margin-container">
                        <label htmlFor="basic-url">Target Margin</label>
                        <div className="input-group">
                            <input type="text" id="targetMargin" className="form-control" aria-label="Target margin reinvest"
                            onChange={(e) => {updateInputs(e)}} maxLength="2" value={targetMargin}/>
                            <div className="input-group-append">
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                        <div style={{transform: err.targetMargin ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
                            <span className="error-arrow"></span>
                            <p>Input a percentage!</p>
                        </div>
                    </div>
                    <div className="profit-reinvestment-container">
                        <label htmlFor="basic-url">Profit Reinvestment</label>
                        <div className="input-group">
                            <input type="text" id="profitReinvestment" className="form-control" aria-label="Target margin reinvest"
                            onChange={(e) => {updateInputs(e)}} maxLength="2" value={profitReinvestment}/>
                            <div className="input-group-append">
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                        <div style={{transform: err.profitReinvestment ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
                            <span className="error-arrow"></span>
                            <p>Input a percentage!</p>
                        </div>
                    </div>
                    <div className="unusoled-offers-container">
                        <label htmlFor="basic-url">Update Unsold Offers</label>
                        <div className="input-group">
                            <select className="custom-select" id="updateUnsold" onChange={(e) => {updateInputs(e)}}
                            value={updateUnsold}
                            >
                                <option default>Hourly</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                        <div style={{transform: err.updateUnsold ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
                            <span className="error-arrow"></span>
                            <p>Choose an interval!</p>
                        </div>
                    </div>
                    <div className="daily-budget-container">
                        <label htmlFor="basic-url">Daily Budget</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="dailyBudget" aria-label="Daily budget"
                            onChange={(e) => {updateInputs(e)}} value={dailyBudget}/>
                            <div className="input-group-append">
                                <span className="daily-budget-text">Edit</span>
                            </div>
                        </div>
                        <div style={{transform: err.dailyBudget ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
                        <span className="error-arrow"></span>
                        <p>Choose one!</p>
                    </div>
                    </div>
                </div>

                {/* AUTO RENTING CONTAINER */}
                <div className="automatic-renting-container">
                    <ToggleSwitch  
                        handleChange={(e) => {updateInputs(e)}}
                        id={"autoRent"}
                        htmlFor={"autoRent"}
                        isOn={autoRent}
                    />

                    <div className="automatic-renting-content">
                        <h5>Automatic Renting</h5>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="spot" 
                            value='spot'
                            name="auto-rent"
                            onChange={(e) => {
                                updateInputs(e)
                            }} />
                            <label className="form-check-label" htmlFor="spotProfitable">
                                Mine only when spot profitable
                            </label>
                        </div>
                        <div className="percent-container">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="alwaysMineXPercent"
                                value='alwaysMineXPercent'
                                name="auto-rent"
                                onChange={(e) => {updateInputs(e)}} />
                                <label className="form-check-label" htmlFor="alwaysMineXPercent">
                                    Always mine {miningOperations.Xpercent}% of the network
                                </label>
                            </div>
                            <div className="percent-input-container" >
                            {/* <label for="validationCustom02">Last name</label> */}
                            <input type="text" className="form-control percent-field" id="Xpercent" 
                                required placeholder="0" onChange={(e) => {editPercent(e)}} maxLength="2"
                                value={Xpercent}
                            />
                            <span>%</span>
                            <button className="edit-percent-btn">edit percentage</button>
                            </div>
                        </div>
                        <div style={{transform: err.autoRent ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
                            <span className="error-arrow"></span>
                            <p>Need at least one checked before renting!</p>
                        </div>
                    </div>
                </div>

                {/* Select Rental Markets & Mining Pool */}
                <button onClick={() => setShowSettingsModal(!showSettingaModal)} className="select-markets-pools">Select Rental Markets & Mining Pools</button>

                {/* AUTO TRADING CONTAINER */}
                <div className="automatic-trading-container">
                    <ToggleSwitch  
                            handleChange={(e) => {updateInputs(e)}}
                            id={"autoTrade"}
                            htmlFor={"autoTrade"}
                            isOn={autoTrade}
                    />
                    <div className="automatic-renting-content">
                        <h5>Automatic Trading</h5>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="morphie" 
                            // value={morphie}
                            checked={morphie}
                            name="auto-trading"
                            onChange={(e) => {updateInputs(e)}}  />
                            <label className="form-check-label" htmlFor="morphie">
                                Prefer the Morphie DEX
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="supportedExchange"
                            // value={supportedExchange}
                            name="auto-trading"
                            onChange={(e) => {updateInputs(e)}} />
                            <label className="form-check-label" htmlFor="supportedExchange">
                                Supported exchanges
                            </label>
                        </div>
                        <div style={{transform: err.autoTrade ? 'scale(1)' : 'scale(0)'}} className="error-dialog">
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


export default MiningOperations
