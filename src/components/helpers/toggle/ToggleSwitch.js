import React from 'react';
import './ToggleSwitch.css'

const ToggleSwitch = ({handleChange, id, htmlFor, isOn}) => {


    const on = {transform: `translateX(50px)`}
    const off  = {transform: `translateX(0px)`}


    return (
      <div className="rent-toggle-switch">
        <span className="on">ON</span>
        <div className="slider-container" style={isOn ? on : off}>
            <span className="round-toggle" />
            <label className="auto-label-after" htmlFor={htmlFor}>OFF</label>
            <input id="auto-toggle" className="auto-toggle"
            checked={isOn} 
            id={id}
            type="checkbox"
            name="auto-slider"
            onChange={handleChange} 
            />
        </div>
      </div>
    );
  };
  
  export default ToggleSwitch