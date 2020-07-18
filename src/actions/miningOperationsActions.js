import { PROVIDER, PERCENT_MODAL, RETURNED_RENT_VALUES } from './types';
import { API_URL } from '../../config';


export const rentValues = (inputs, whatToDo) => async (dispatch) =>{
    if (inputs.targetMargin === '' || inputs.profitReinvestment === '' || inputs.Xpercent === '' || inputs.token === '') return

    if(inputs.token === 'RVN') {
        inputs.algorithm = 'KAWPOW'
    } else {
        inputs.algorithm = 'SCRYPT'
    }

    const Percent = inputs.Xpercent
    const numString = Percent+''

    // Percent has to consist of a number 1 - 9
    if(! /[1-9]/.test(numString) ) return

    inputs.whatToDo = whatToDo
    inputs.to_do = 'returnSpartanBot'

    fetch(API_URL+'/rent-values',{
        method: 'POST',
        headers: {  
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(inputs)
    })
    .then(data => data.json())
    .then((data)=> {
        // if (whatToDo === "getRentalValues") dispatch(isNiceHashMinimum(Percent, data.Networkhashrate))
        dispatch(returnValues(data))
    })
    .catch(e => console.log(e))
}

export const returnValues = (data) => (dispatch) => {
    console.log('data: dailybudget in actions', data)
        dispatch({
            type: RETURNED_RENT_VALUES,
            payload: data
        })
}


// export const isNiceHashMinimum = (percent = 0, NetworkhashrateFlo = 0, status) => (dispatch) => {
    export const isNiceHashMinimum = (data) => (dispatch) => {
    console.log('data:', data)
    return dispatch({
        type: PERCENT_MODAL,
        payload: data
    })
    // const Percent = percent / 100
    // const networkHashRate = NetworkhashrateFlo * ( - Percent  / ( -1 + Percent ) )
    // if(status) {
    //     return dispatch({
    //         type: PERCENT_MODAL,
    //         payload: status
    //     })
    // }

    // if (networkHashRate < 0.01 ) {
    //     dispatch({
    //         type: PERCENT_MODAL,
    //         payload: 'open'
    //     })
    // } 
    // else {
    //     console.log('CLOSE')
    //     dispatch({
    //         type: PERCENT_MODAL,
    //         payload: 'close'
    //     })
    // }
}