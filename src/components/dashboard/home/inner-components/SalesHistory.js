import React, { useState, useEffect } from 'react';
import { formatToDate , formatTime} from '../../../../helpers-functions/dateFormatter';
import { connect } from 'react-redux';
import { getSalesHistory, getLatestExPrice } from '../../../../actions/bittrexActions'


//grab rest of data from profiles/spartan bot
const SalesHistory = (props) => {

    useEffect(() => {
            props.getSalesHistory();
            props.getLatestExPrice();

        }, [props.user])


    const renderTableData = (obj) => {
        let btc = 0;
        let revenue = 0;
        let margin = 0;
        let link = '#';

        if(props.exchangePrice){
            btc = props.exchangePrice.BTC.Ask
            revenue = (obj.Price * btc).toFixed(2)
        }

        

          let price = (btc * obj.PricePerUnit).toFixed(2); 
            switch(obj.Exchange){
                case 'BTC-FLO': {
                    return (
                        <tr key={obj.OrderUuid}>
                        <td>{formatToDate(obj.Closed) + ' ' + formatTime(obj.Closed)}</td>
                        <td>{obj.Quantity}</td>
                        <td>${price}</td>
                        <td>{margin}%</td>
                        <td>${revenue}</td>
                        <td><a href={link}>view</a></td>
                        </tr>
                    )
                }
                case 'BTC-RVN': {
                    return (
                        <tr key={obj.OrderUuid}>
                        <td>{formatToDate(obj.Closed) + ' ' + formatTime(obj.Closed)}</td>
                        <td>{obj.Quantity}</td>
                        <td>${price}</td>
                        <td>{margin}%</td>
                        <td>${revenue}</td>
                        <td><a href={link}>view</a></td>
                        </tr>
                    )
                }

                default: return null
            

        }
    };


    const ShowMore = () => {

        if(!props.saleHistory) {
            return null;
        }

        if(!props.saleHistory.length < 5){
            return null;
        }

        return <div>Show More</div>
    }

    const renderTableHeader = (obj) => {

        switch(obj){
            case 'BTC-FLO':
                return (
                    <>
                        <th scope="col">Completed On</th>
                        <th scope="col"># of FLO</th>
                        <th scope="col">$ per FLO</th>
                        <th scope="col">Margin</th>
                        <th scope="col">Revenue</th>
                        <th scope="col">Explorer</th>

                    </>
                );
            case 'BTC-RVN':
                return (
                    <>
                        <th scope="col">Completed On</th>
                        <th scope="col"># of RVN</th>
                        <th scope="col">$ per RVN</th>
                        <th scope="col">Margin</th>
                        <th scope="col">Revenue</th>
                        <th scope="col">Explorer</th>

                    </>
                );
            default: return null

        }
    };


    const renderTableBodies = () => {

        if(!props.saleHistory){
            return;
        }

        const body = Object.keys(props.saleHistory).map((obj, i) =>{

        return (<tbody key={i}>
                    <tr>{renderTableHeader(obj)}</tr>
                        {renderTableData(props.saleHistory[obj])}
                </tbody>)
        })

        return body
    }


    return (
        <div className="card open-orders">
            <div className="card-header">Sales History</div>
            <div className="card-body">
                <table className="table table-bordered" id="open-orders">
                    {renderTableBodies()}
                </table>
                <ShowMore />
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        error: state.error,
        user: state.auth.user,
        account: state.account,
        saleHistory: state.bittrex.salesHistory,
        exchangePrice: state.bittrex.exchangePrice
    };
};


export default connect(mapStateToProps, {getSalesHistory, getLatestExPrice})(SalesHistory);
