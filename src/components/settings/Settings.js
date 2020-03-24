import React, { useState, useEffect, useRef } from 'react';
import { ROOT_URL } from '../../../config.js';
import MercMode from './prefrences/merc/MercMode';

const Settings = () => {

    async function rent(e) {

        e.preventDefault()
        let data = {
            hashrate: ".001",
            duration: "3"       
        }
        console.log('setup_Provider ran', data)
        try {
            const response = await fetch(`${ROOT_URL}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
          
            });
        
            let res = await response.json()
            console.log('res:', res)


        } catch (e) {
            console.log('Catch error: Settings.js line 20',e)
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
            <MercMode />
            
        </div>
    )
}
export default Settings