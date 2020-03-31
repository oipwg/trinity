import React, { useState } from 'react';
import ToggleSwitch from '../../../helpers/ToggleSwitch';
import './MercMode.css'

const MercMode = () => {
    const [value, setValue] = useState(false);



   return( 
        <div id="merc">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{paddingRight: '.2rem'}}>
                Engage Merc Mode
                </div>
                <div style={{transform: 'scale(0.7)', display: 'inherit'}}>
                <ToggleSwitch
                    isOn={value}
                    handleToggle={() => setValue(!value)}
                    />
                </div>
                <label style={{paddingRight: '.2rem'}} >Daily Budget</label>
                <input type="number" placeholder="$50" style={{width:"45px"}}></input>
            </div>
                <span><strong>
                Automatically rent miners for me
                </strong>
                </span>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{paddingRight: '.wrem'}}>
                Always
                </div>
                <div style={{transform: 'scale(0.7)', display: 'inherit'}}>
                <ToggleSwitch
                    isOn={value}
                    handleToggle={() => setValue(!value)}
                    />
                </div>
                <label style={{paddingRight: '.2rem'}} >Only when spot profitable; at a margin of at least:</label>
                <input type="number" placeholder="10%" style={{width:"45px"}}></input>
            </div>



                {/* *
                "header-a item-1 item-2"
                "header-b item-3 item-4"
                "header-c item-5 item-6"
                "header-d item-7 item-8"
                 */}
                <div className="grid-container">
                    <div className="header-a">
                        Mine these blockchains: 
                    </div>
                    <div className="header-b">
                        Using these rental markets: 
                    </div>
                    <div className="header-c">
                        Using these mining pools:
                    </div>
                    <div className="header-d">
                        Open new trade offers for me
                        on these exchanges:
                    </div>
                    <div className="item-1">
                        <>
                        <input type="checkbox" name="flo" />
                        <label htmlFor="flo">Flo</label>
                        </>
                    </div>
                    <div className="item-2">
                        <>
                        <input type="checkbox" name="rvn" />
                        <label htmlFor="rvn">Rvn</label>
                        </>
                    </div>
                    <div className="item-3">
                        <input type="checkbox" name="mrr" />
                        <label htmlFor="mrr">MiningRigRentals.com</label>

                        <br/>
                        <input type="checkbox" name="nh" />
                        <label htmlFor="nh">Nicehash.com</label>
                    </div>

                    <div className="item-4">
                        <input type="checkbox" name="mrr" />
                        <label htmlFor="mrr">MiningRigRentals.com</label>

                        <br/>
                        <input type="checkbox" name="nh" />
                        <label htmlFor="nh">Nicehash.com</label>
                    </div>

                    <div className="item-5">
                        <input type="checkbox" name="aPool" />
                        <label htmlFor="aPool">Alexandria.io/pool</label>
                        <br/>
                        <input type="checkbox" name="nPool" />
                        <label htmlFor="nPool">NanoPool</label>
                        <br/>
                        <input type="checkbox" name="mPool" />
                        <label htmlFor="mPool">MediciLandGov</label>
                        <br/>
                        <input type="checkbox" name="oPool" />
                        <label htmlFor="oPool">Another Pool</label>
                    </div>

                    <div className="item-6">
                        <input type="checkbox" name="aPool" />
                        <label htmlFor="aPool">Alexandria.io/pool</label>
                        <br/>
                        <input type="checkbox" name="nPool" />
                        <label htmlFor="nPool">NanoPool</label>
                        <br/>
                        <input type="checkbox" name="mPool" />
                        <label htmlFor="mPool">MediciVentures</label>
                    </div>

                    <div className="item-7">
                        <input type="checkbox" name="bittrex" />
                        <label htmlFor="bittrex">Bittrex.com</label>
                        <br/>
                        <input type="checkbox" name="tok" />
                        <label htmlFor="tok">Tokok.com</label>
                    </div>

                    <div className="item-8">
                        <input type="checkbox" name="bittrex" />
                        <label htmlFor="bittrex">Bittrex.com</label>
                        <br/>
                        <input type="checkbox" name="tok" />
                        <label htmlFor="tok">Tokok.com</label>
                    </div>
                </div>

            <div>
                <label for="unsold">Update unsold offers for me:</label>
                <select name="unsold" id="unsold-select">
                    <option value="hourly">Hourly</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>

            <div>
                Whens offers close, keep{' '}
                <input type="number" placeholder="20%" style={{width:"45px"}}></input>
                {' '}of gains and add the rest to my daily budget.
            </div>

        </div>

)
}

export default MercMode;