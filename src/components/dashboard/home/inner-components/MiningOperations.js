import React, { useState, useEffect } from 'react';
import { ROOT_URL, API_URL } from '../../../../../config.js';

const MiningOperations = (props) => {
    const [err, setError] = useState({autoRent: false, autoTrade: false})
    const [miningOperations, setOperations] = useState({
            targetMargin: '',
            profitReinvestment: 0,
            updateUnsold: '',
            dailyBudget: '',
            autoRent: false,
            spot: false,
            alwaysMineXPercent: false,
            autoTrade: false,
            morphie: false,
            supportedExchange: false,
            Xpercent: 0
        });
    const [blur, setBlur] = useState(false);
    const [focus, setFocus] = useState(false);

    console.log(miningOperations)
    console.log(props)

    useEffect(() => {
        if(blur && focus && (miningOperations)){
            console.log('running update')
            // console.log(selectedProfile)
            // props.updateProfile(selectedProfile)
            // setBlur(!blur)
            // setFocus(!focus)
        }
    })


    useEffect(() => {
        rent(miningOperations)
    },[miningOperations.autoRent, miningOperations.autoTrade ])

    const toggleSlider = (e) => {
        const regex = /\d+/i;
        const current = e.target.parentNode;
        const sliders = document.querySelectorAll('.slider-container')
        let targetPos = current.style.transform.match(regex)[0]

        let obj = {}
        let i = 0
        
        while(i < 2) {
            let slider = sliders[i]
            let pos = slider.style.transform.match(regex)[0]
            // Current slider clicked
            if (current === slider) {
                let target = slider.childNodes[2].id
                
                if (pos === "50") {
                    obj[target] = false
                    slider.style.transform = "translateX(0px)"
                }
                if( pos === "0") {
                    obj[target] = true
                    slider.style.transform = "translateX(50px)"
                }
            // Everything but current slider 
            } else {
                let target = slider.childNodes[2].id
                obj[target] = false
                // If wanted to toggle back and forth 
                // slider.style.transform = targetPos === "50" ? "translateX(50px)" : "translateX(0px)"; 
                slider.style.transform = "translateX(0px)";
            }
            i++
        }
        setOperations({...miningOperations, ...obj})
    }

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

    const checkInputsAndRent = (e) => {
  
        let profile = {}
       
        for (let key in miningOperations) {
            console.log(key)
            switch (key) {
                case 'targetMargin':
                    if (miningOperations[key] === '') 
                        return setError({targetMargin: true})
                    break;
                case 'profitReinvestment':
                    if (miningOperations[key] === '') 
                        return setError({profitReinvestment: true})
                case 'updateUnsold':
                    if (miningOperations[key] === '') 
                        return setError({updateUnsold: true})
                case 'dailyBudget':
                    if (miningOperations[key] === '') 
                        return setError({dailyBudget: true})
                case 'updateUnsold':
                    if (miningOperations[key] === '') 
                        return setError({updateUnsold: true})
                case 'autoRent':
                    if (miningOperations.spot === miningOperations.alwaysMineXPercent) {
                        // If neither radios are checked
                        return setError({autoRent: true})
                    }
                    toggleSlider(e)
                    break;
                case 'autoTrade':
                    if (miningOperations.morphie === miningOperations.supportedExchange) {
                        // If neither radios are checked
                        return setError({autoTrade: true})
                    }
                    toggleSlider(e)
                    break;
            }
        }
    }

    const dataInputs = e => {
        const targetElem = e.target.id
        switch ( targetElem ) {
            case "targetMargin":
                setOperations({...miningOperations, targetMargin: e.target.value})
                break;
            case "profit-reinvestment":
                setOperations({...miningOperations, profitReinvestment: e.target.value})
                break;
            case "updateUnsold":
                setOperations({...miningOperations, updateUnsold: e.target.value})
                break;
            case "dailyBudget":
                setOperations({...miningOperations, dailyBudget: e.target.value})
        }
    }
    const toggleInputs = e => {

        const targetElem = e.target.id
       
        switch ( targetElem ) {
            case "autoRent":
                checkInputsAndRent(e)
                break;
            case "spot":
                setOperations({...miningOperations, spot: true, alwaysMineXPercent: false})
                break;
            case "alwaysMineXPercent":
                setOperations({...miningOperations, alwaysMineXPercent: true, spot: false})
                break;
            case "autoTrade":
                checkInputsAndRent(e)
                break;
            case "morphie":
                setOperations({...miningOperations, morphie: true, supportedExhange: false})
                break;
            case "supportedExchange":
                setOperations({...miningOperations, supportedExchange: true, morphie: false})
        }
    }

    const editPercent = e => {
        let value = e.target.value
        setOperations({...miningOperations, Xpercent: value})
    }
    
    return (
        
        <div className="card mining-operation">
            <div className="card-header">Mining Operations</div>
            <div className="card-body">
                <div className="mining-operation-inputs">
                    <div className="target-margin-container">
                        <label htmlFor="basic-url">Target Margin</label>
                        <div className="input-group">
                            <input type="text" id="targetMargin" className="form-control" aria-label="Target margin reinvest"
                             onKeyUp={(e) => {dataInputs(e)}} maxLength="2"/>
                            <div className="input-group-append">
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="profit-reinvestment-container">
                        <label htmlFor="basic-url">Profit Reinvestment</label>
                        <div className="input-group">
                            <input type="text" id="profit-reinvestment" className="form-control" aria-label="Target margin reinvest"
                            onKeyUp={(e) => {dataInputs(e)}} maxLength="2"/>
                            <div className="input-group-append">
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="unusoled-offers-container">
                        <label htmlFor="basic-url">Update Unsold Offers</label>
                        <div className="input-group">
                            <select className="custom-select" id="updateUnsold" onChange={(e) => {dataInputs(e)}}>
                                <option default>Hourly</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="daily-budget-container">
                        <label htmlFor="basic-url">Daily Budget</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="dailyBudget" aria-label="Daily budget"/>
                            <div className="input-group-append">
                                <span className="daily-budget-text">Edit</span>
                            </div>
                        </div>
                    </div>
                </div>
  
                <div className="automatic-renting-container">
                    <div className="rent-toggle-switch">
                        <span className="on">ON</span>
                        <div className="slider-container" style={{transform: `translateX(0)`}}>
                            <span className="round-toggle" />
                            <label className="auto-label-after" htmlFor="autoRent">OFF</label>
                            <input id="auto-toggle" className="auto-toggle" 
                            value={miningOperations.autoRent}
                            id="autoRent"
                            type="checkbox"
                            name="auto-slider"
                            onChange={(e) => {toggleInputs(e)}} />
                        </div>
                    </div>
                    <div className="automatic-renting-content">
                        <h5>Automatic Renting</h5>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="spot" 
                            value="spot"
                            name="auto-rent"
                            onChange={(e) => {toggleInputs(e)}}  />
                            <label className="form-check-label" htmlFor="spotProfitable">
                                Mine only when spot profitable
                            </label>
                        </div>
                        <div className="percent-container">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" id="alwaysMineXPercent"
                                value="alwaysMineXPercent"
                                name="auto-rent"
                                onChange={(e) => {toggleInputs(e)}} />
                                <label className="form-check-label" htmlFor="alwaysMineXPercent">
                                    Always mine {miningOperations.Xpercent}% of the network
                                </label>
                            </div>
                            <div className="percent-input-container" >
                            {/* <label for="validationCustom02">Last name</label> */}
                            <input type="text" className="form-control percent-field" id="Xpercent" 
                             required placeholder="0" onChange={(e) => {editPercent(e)}} maxLength="2"/>
                            <span>%</span>
                            <button className="edit-percent-btn">edit percentage</button>
                            </div>
                        </div>
                        <div className="error-dialog">
                            <span className="error-arrow"></span>
                            <p>Need at least one checked before renting!</p>
                        </div>
                        
                    </div>
                </div>
                <div className="automatic-trading-container">
                    <div className="rent-toggle-switch">
                        <span className="on">ON</span>
                        <div className="slider-container" style={{transform: `translateX(0)`}}>
                            <span className="round-toggle" />
                            <label className="auto-label-after" htmlFor="autoTrade">OFF</label>
                            <input id="auto-toggle" className="auto-toggle" 
                            // On change updates oppisite of current state
                            value={miningOperations.autoTrade}
                            name="auto-slider"
                            id="autoTrade"
                            type="checkbox" 
                            onChange={(e) => {toggleInputs(e)}} />
                        </div>
                    </div>
                    <div className="automatic-renting-content">
                        <h5>Automatic Trading</h5>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="morphie" 
                            value="morphie"
                            name="auto-trading"
                            onChange={(e) => {toggleInputs(e)}}  />
                            <label className="form-check-label" htmlFor="morphie">
                                Prefer the Morphie DEX
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="supportedExchange"
                            value="supportedExchange"
                            name="auto-trading"
                            onChange={(e) => {toggleInputs(e)}} />
                            <label className="form-check-label" htmlFor="supportedExchange">
                                Supported exchanges
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default MiningOperations
