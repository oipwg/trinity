import React from 'react';
import { connect } from 'react-redux';


const Profile = (props) => {
    return (        
        <div className="card" style={{ display: 'block', margin: '20px'}}>
            <div className="card-body">
            <label htmlFor="profile-select" style={{marginRight: '35px'}}>Select Profile:</label>
                <select style={{width: "8rem"}}name="profiles" id="profile-select">
                <option value="bob">tiger king</option>
                </select>    
            </div>
        </div>
    
)
}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    };
};


export default connect(mapStateToProps)(Profile)