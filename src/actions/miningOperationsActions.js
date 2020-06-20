import { DAILY_BUDGET, PROVIDER, PERCENT_MODAL } from './types';
import { API_URL } from '../../config';


export const updateDailyBudget = (inputs, upDateNiceHashMinimum) => async (dispatch) =>{
    if (inputs.targetMargin === '' || inputs.profitReinvestment === '' || inputs.Xpercent === '') return
    const Percent = inputs.Xpercent

    inputs.to_do = 'returnSpartanBot'

    fetch(API_URL+'/daily-budget',{
        method: 'POST',
        headers: {  
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(inputs)
    })
    .then(data => data.json())
    .then((data)=> {
        let dailyBudget = data.EstRentalBudgetPerCycleUSD.toFixed(2)
        if (upDateNiceHashMinimum) dispatch(isNiceHashMinimum(Percent, data.Networkhashrate))
  
        dispatch({
            type: DAILY_BUDGET,
            payload: dailyBudget
        })
    })
    .catch(e => console.log(e))
}


export const isNiceHashMinimum = (percent = 0, NetworkhashrateFlo = 0, status) => (dispatch) => {
    const Percent = percent / 100
    const networkHashRate = NetworkhashrateFlo * ( - Percent  / ( -1 + Percent ) )
    if(status) {
        return dispatch({
            type: PERCENT_MODAL,
            payload: status
        })
    }
    console.log('NetworkhashrateFlo:', NetworkhashrateFlo * ( - Percent  / ( -1 + Percent ) ))
    if (networkHashRate < 0.01 ) {
        dispatch({
            type: PERCENT_MODAL,
            payload: 'open'
        })
    } 
    else {
        console.log('CLOSE')
        dispatch({
            type: PERCENT_MODAL,
            payload: 'close'
        })
    }
}