import React, { useState } from 'react';

const OpenOrders = () => {
    const [fakeData, setFakeData] = useState({
        data: [
            {
                date: Date.now(),
                numOfFlo: 43.324,
                amountOfFlo: 21,
                margin: 10,
                revenue: '20',
            },
            {
                date: Date.now(),
                numOfFlo: 43.324,
                amountOfFlo: 21,
                margin: 10,
                revenue: '20',
            },
            {
                date: Date.now(),
                numOfFlo: 43.324,
                amountOfFlo: 21,
                margin: 10,
                revenue: '20',
            },
        ],
    });

    const renderTableData = () => {
        return fakeData.data.map((data, i) => {
            const { date, numOfFlo, amountOfFlo, margin, revenue } = data;

            return (
                <tr key={i}>
                    <td>{date}</td>
                    <td>{numOfFlo}</td>
                    <td>${amountOfFlo}</td>
                    <td>{margin}%</td>
                    <td>{revenue}</td>
                </tr>
            );
        });
    };

    const renderTableHeader = () => {
        // let header = Object.keys(fakeData.students[0]);
        // return header.map((key, i) => {
        //     return <th key={i}>{key.toUpperCase()}</th>;
        // });

        return (
            <>
                <th scope="col">Open Date</th>
                <th scope="col"># of FLO</th>
                <th scope="col">$ per FLO</th>
                <th scope="col">Margin</th>
                <th scope="col">Revenue</th>
            </>
        );
    };

    return (
        <div className="card open-orders">
            <div className="card-header">Open Orders</div>
            <div className="card-body">
                <table className="table table-bordered" id="open-orders">
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTableData()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OpenOrders;
