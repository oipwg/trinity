import React, {useState} from 'react'
import ToggleSwitch from '../../../helpers/toggle/ToggleSwitch';



const Preferences = () => {
    const [value, setValue] = useState(false);
    const [value2, setValue2] = useState(false);


    return (
        <div className="card">
        <div className="card-body" style={{display: 'flex', alignItems: 'center'}}>
        <span style={{paddingRight: '15px'}}>
            <ToggleSwitch 
                isOn={value}
                handleToggle={() => setValue(!value)}
            />
        </span>
        <div style={{border: '1px solid black', padding: '15px'}}>
            <h5>Automatic Renting</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Suspendisse dictum, dui sit amet rhoncus vehicula, felis leo suscipit turpis, in tempus enim neque eget eros. Phasellus vel magna eget purus tincidunt efficitur. Suspendisse at congue felis. Sed scelerisque quam eget pharetra venenatis.
                {' '}<a href="#">Learn More</a>
            </p>
        </div>
        </div>

        <div className="card-body" style={{display: 'flex', alignItems: 'center'}}>
        <span style={{paddingRight: '15px'}}>
                <ToggleSwitch
                    isOn={value2}
                    handleToggle={() => setValue(!value2)}                    
                />
        </span>
        <div style={{border: '1px solid black', padding: '15px'}}>
            <h5>Engage Phalanx</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Suspendisse dictum, dui sit amet rhoncus vehicula, felis leo suscipit turpis, in tempus enim neque eget eros. Phasellus vel magna eget purus tincidunt efficitur. Suspendisse at congue felis. Sed scelerisque quam eget pharetra venenatis.
                {' '}<a href="#">Learn More</a>
            </p>
        </div>
        </div>
        </div>
    )
}

export default Preferences