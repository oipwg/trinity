import React, { useState, useEffect } from 'react';
import { formatToDate , formatTime} from '../../../../helpers-functions/dateFormatter';
import { connect } from 'react-redux';
import {getOpenOrder} from '../../../../actions/bittrexActions'



const OpenOrders = (props) => {

    useEffect(() => {
        props.getOpenOrder();
}, [props.user])


    const renderTableData = (obj) => {
            let price = (obj.Quantity * obj.Price).toFixed(2); 
            switch(obj.Exchange){
                case 'BTC-FLO': {
                    return (
                        <tr key={obj.OrderUuid}>
                        <td>{formatToDate(obj.Opened) + ' ' + formatTime(obj.Opened)}</td>
                        <td>{obj.Quantity}</td>
                        <td>${obj.Price || price}</td>
                        {/* <td>{margin}%</td>
                        <td>${revenue}</td> */}
                        {/* <td><a href={link}>view</a></td> */}
                        </tr>
                    )
                }
                case 'BTC-RVN': {
                    return (
                        <tr key={obj.OrderUuid}>
                        <td>{formatToDate(obj.Opened) + ' ' + formatTime(obj.Opened)}</td>
                        <td>{obj.Quantity}</td>
                        <td>${obj.Price || price}</td>
                        {/* <td>{margin}%</td>
                        <td>${revenue}</td> */}
                        {/* <td><a href={link}>view</a></td> */}
                        </tr>
                    )
                }
                default: return null



        }
    }

    const ShowMore = () => {

        if(!props.openOrders) {
            return null;
        }

        if(!props.openOrders.length < 5){
            return null;
        }

        return <div>Show More</div>
    }

    const renderTableHeader = (obj) => {

        switch(obj){
            case 'BTC-FLO':
                return (
                    <>
                        <th scope="col">Open Date</th>
                        <th scope="col"># of FLO</th>
                        <th scope="col">$ per FLO</th>
                        <th scope="col">Margin</th>
                        <th scope="col">Revenue</th>
                    </>
                );
            case 'BTC-RVN':
                return (
                    <>
                        <th scope="col">Open Date</th>
                        <th scope="col"># of RVN</th>
                        <th scope="col">$ per RVN</th>
                        <th scope="col">Margin</th>
                        <th scope="col">Revenue</th>
                    </>
                );
            default: return null

        }
    };

    const renderTableBodies = () => {

        if(!props.openOrders){
            return;
        }

        const body = Object.keys(props.openOrders).map((obj, i) =>{

        return (<tbody key={i}>
                    <tr>{renderTableHeader(obj)}</tr>
                        {renderTableData(props.openOrders[obj])}
                </tbody>)
        })

        return body
    }


    return (
        <div className="card open-orders">
            <div className="card-header">Open Orders</div>
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
        openOrders: state.bittrex.openOrders
    };
};

export default connect(mapStateToProps, {getOpenOrder})(OpenOrders);
