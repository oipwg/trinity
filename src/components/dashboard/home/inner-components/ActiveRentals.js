import React from 'react';
import { crypto } from '../../../../helpers-functions/cryptoCurrencies';
const ActiveRentals = (props) => {

    const fakeProps = {
        hashes: 25,
        rigs: 3,
        cost: 37
    }

    let {
        hashes,
        rigs,
        cost,
    } = fakeProps



const icon = () => {

    if(!props.profile){
        return;
    }
    switch(props.profile.token){
        case "FLO":
            return  <img src={crypto.flo.icon} alt={crypto.flo.name} width='88px' />
        case "RVN":
            return <img src={crypto.raven.icon} alt={crypto.raven.name} width='88px' />
        default:{
            return <div>Make a Profile & Start a Rental</div>
        }
    }




}


    return (
        <div className="card active-rentals">
            <div className="card-header">Active Rentals</div>
        {props.profile &&       
            <div className="card-body">
                    <div className="active-rentals-items-container">
                        <div>
                            {icon()}
                        </div>
                    <div className="active-rentals-item">
                            <h6>Hashes</h6>
                            <h3>{hashes} MH/s</h3>
                        </div>
                        <div className="active-rentals-item">
                            <h6>Rigs</h6>
                            <h3>{rigs}</h3>
                        </div>
                        <div className="active-rentals-item">
                            <h6>Cost</h6>
                            <h3>${cost}</h3>
                        </div>
                    </div>
                        <a href="#" >View Rentals</a>
                </div>
            }
        </div>
    );
};

export default ActiveRentals;
