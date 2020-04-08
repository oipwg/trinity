import React from 'react';

const ManualRentForm = (props) => (
    
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
                    <input type="text" className="form-control" id="duration" placeholder=".5"/>
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="limit">Limit (GH/s)</label>
                    <input type="text" className="form-control" id="hashrate" placeholder="min 10.0"/>
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="amount">Amount (BTC)</label>
                    <input type="text" className="form-control" id="amount" placeholder=".005"/>
                </div>
            </div>
            <button type="submit" className="btn btn-primary" onClick={props.rent}>RENT</button>
        </form>
    </div>
);

export default ManualRentForm