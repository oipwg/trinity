import { DAILY_BUDGET } from './types';
import { API_URL } from '../../config';


export const updateDailyBudget = (inputs) => async (dispatch) =>{
    if (inputs.targetMargin === '' || inputs.profitReinvestment === '' || inputs.Xpercent === '') return

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
        dispatch({
            type: DAILY_BUDGET,
            payload: data
        })
        
    })
    .catch(e => console.log(e))
}

