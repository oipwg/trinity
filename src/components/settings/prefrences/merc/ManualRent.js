import React, { useState } from 'react';

const ManualRentForm = (props) => {
    const [miningOperations, setOperations] = useState({
        rentType: '',
    
    });
    const change = (e) => {
        setOperations({rentType: e.target.value})
        console.log(e.target.value)
    }
    return (
    <div>
        <form className="mmr container">
            <h4>Mining Rig Rentals</h4>
            <div className="form-row">
            <div className="form-group col-md-4">
                <label htmlFor="duration">Duration</label>
                <input
                    type="text"
                    id="duration"
                    className="form-control"
                    aria-describedby="hashrate"
                    placeholder="hours" />
            </div>
            <div className="form-group col-md-4">
                <label htmlFor="duration">Hashrate (BTC/TH)</label>
                <input
                    type="text"
                    id="hashrate"
                    className="form-control"
                    aria-describedby="hashrate"
                    placeholder="hashrate" />
            </div>
            </div>
            <button type="submit" className="btn btn-primary" onClick={props.rent}>RENT</button>
            </form>
            <form style={{marginTop: '50px'}} className="nh container">
            <h4>Nice Hash Renting</h4>
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label htmlFor="price">Price / Hashrate (BTC/TH/day)</label>
                    <input type="text" className="form-control" id="durationNH" placeholder=".5"/>
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="limit">Limit (GH/s)</label>
                    <input type="text" className="form-control" id="hashrateNH" placeholder="min 10.0"/>
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="amount">Amount (BTC)</label>
                    <input type="text" className="form-control" id="amount" placeholder=".005"/>
                </div>
            </div>
            <button type="submit" className="btn btn-primary" onClick={props.rent}>RENT</button>
        </form>
 <div className="form-check">
            {console.log(miningOperations.rentType)}
  <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" onChange={(e) =>{change(e)}}/>
  <label className="form-check-label" htmlFor="exampleRadios1">
    Default radio
  </label>
</div>
<div className="form-check">
  <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2" onChange={(e) =>{change(e)}}/>
  <label className="form-check-label" htmlFor="exampleRadios2">
    Second default radio
  </label>
</div>
<div className="form-check">
  <input className="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3" value="option3" onChange={(e) =>{change(e)}}/>
  <label className="form-check-label" htmlFor="exampleRadios3">
    Disabled radio
  </label>
</div>
    </div>
);
}
export default ManualRentForm