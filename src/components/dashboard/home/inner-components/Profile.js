import React from 'react';
import { connect } from 'react-redux';


const Profile = (props) => {
    console.log(props)
    let user = ''

    if(props.user){
        user = props.user.userName
    }


    return (        
        <div className="card profile">
            <div className="card-body">
            <label htmlFor="profile-select" style={{marginRight: '35px'}}>Select Profile:</label>
                <select style={{width: "8rem"}}name="profiles" id="profile-select">
                <option value={user}>{user}</option>
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