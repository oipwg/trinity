import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../../config.js';

const Settings = () => {

    async function rent(e) {

        e.preventDefault()
        // 1 TH/s = 1,000 GH/s = 1,000,000 MH/s = 1,000,000,000 kH/s
        let data = {
            // hashrate: ".0079",
            hashrate: ".01",
            // hashrate: ".001",
            duration: "3"       
        }
        console.log('setup_Provider ran', data)
        try {
            const response = await fetch(API_URL+'/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data) 
          
            });
        
            let res = await response.json()
            console.log('res:', res)


        } catch (e) {
            console.log('Catch error: Settings.js line 30',e)
        }
    }

    return (
        <div>
            <form>
            <input
                type="text"
                id="hashrate"
                className="form-control mx-sm-4"
                aria-describedby="hashrate"
                placeholder="hashrate"/>
                <button type="submit" className="btn btn-submit" onClick={rent}>RENT</button>
            </form>
        </div>
    )
}
export default Settings