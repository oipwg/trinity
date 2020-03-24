import React from 'react';


const MercMode = () => {


   return( 
        <div>
            <ul>
                <li>
                    <div className="custom-control custom-switch">
                    <input type="checkbox" className="custom-control-input" id="customSwitches" />
                    <label className="custom-control-label" htmlFor="customSwitches">Engage Merc Mode</label>
                    </div>



                </li>
                <li>Automatically rent miners for me:
                    <div>
                        Always
                    </div>
                    <div>
                        Only when spot profitable; at a margin of at least: 
                    </div>
                </li>
                <li>Mine these blockchains: 
                        <div>Flo</div>
                        <div>RVN</div>
                </li>
                <li>
                    Using these rental markets:
                        <div>MiningRigRentals.com</div>
                        <div>NiceHash.com</div>
                </li>
                <li>Using these mining pools:
                        <div>Alexandria.io/pool</div>
                        <div>Nanopool</div>
                        <div>MediciLandGov</div>
                        <div>Another Pool</div>
                </li>
                <li>Open new trade offers 
                        <div>Bittrex.com</div>
                        <div>Tokok.com</div>
                </li>
                <li>Update unsold offers for me:</li>
                <li>When offers close, keep _ of gains and add the rest to my daily budget</li>
            </ul>



        </div>

)
}

export default MercMode;