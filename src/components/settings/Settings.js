import React, { useState, useEffect, useRef } from 'react';
import { API_URL, ROOT_URL } from '../../../config.js';
// import { ROOT_URL } from '../../../config.js';
import MercMode from './prefrences/merc/MercMode';
import ManualRentForm from './prefrences/merc/ManualRent'

const Settings = () => {

    async function rent(e) {
        const form = e.target.parentNode
        const form_inputs = form.elements

        let length = form_inputs.length
        let data = {}
        for (let i = 0; i < length; i++) {
            const el = form_inputs[i];
            console.log('el:', el.value)
            switch (el.id) {
                case "hashrate":
                    data.hashrate = el.value
                    break;
                case "duration":
                    data.duration = el.value
                    break;
                case "price":
                    data.duration = el.value
                    break;
                case "limit":
                    data.hashrate = el.value
                    break;
                case "amount":
                    data.amount = el.value
                    break;

            }
        }
        console.log(data)
        e.preventDefault()
        // 1 TH/s = 1,000 GH/s = 1,000,000 MH/s = 1,000,000,000 kH/s
        // let NiceHashdata = {
        //     hashrate: ".01",
        //     // hashrate: ".001",
        //     duration: "3"
        // }
        // let MRRdata = {
        //     // hashrate: "5000",  MH/s worked
        //     duration: "3"
        // }
        // console.log('setup_Provider ran', data)

        try {
            const response = await fetch(API_URL + '/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)

            });

            let res = await response.json()
            console.log('res:', res)

        } catch (e) {
            console.log('Catch error: Settings.js line 30', e)
        }
    }


    return (
        <div>
            {<ManualRentForm rent={rent}/>}
            {/* <MercMode /> */}
        </div>
    )
}
export default Settings