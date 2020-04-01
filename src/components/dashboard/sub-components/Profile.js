import React from 'react';

const Profile = () => {
    return (        
        <div className="card" style={{ display: 'block', margin: '20px'}}>
            <div className="card-body">
            <label for="profile-select" style={{marginRight: '35px'}}>Select Profile:</label>
                <select style={{width: "8rem"}}name="profiles" id="profile-select">
                <option value="bob">tiger king</option>
                </select>    
            </div>
        </div>
    
)
}


export default Profile