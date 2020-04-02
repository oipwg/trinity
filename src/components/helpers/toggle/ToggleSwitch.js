import React from 'react';
import './ToggleSwitch.css'

const ToggleSwitch = ({isOn, handleToggle, style}) => {

    return (
      <>
        <input
          checked={isOn}
          onChange={handleToggle}
          className="toggle-switch"
          id={`toggle-switch-new`}
          type="checkbox"
        />
        <label
          style={{ background: isOn && '#0082f9' }}
          className="toggle-switch-label"
          htmlFor={`toggle-switch-new`}
        >
          <span className={`toggle-switch-button`} />
        </label>
      </>
    );
  };
  
  export default ToggleSwitch