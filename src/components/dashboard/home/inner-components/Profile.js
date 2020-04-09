import React, {useState, useEffect} from 'react';
import Modal from '../../../helpers/modal';
import { connect } from 'react-redux';
import { newProfile } from '../../../../actions/profileActions'




const NewProfile = (props) => {

    return (<Modal
                handleClick={props.handleClick}
                classname={'new-profile-modal'}
                title={'Create new profile'}
                headerStyle={{
                    backgroundColor: '#0082f9',
                    color: '#ffffff',
                }}
                modalBody={
                    <div>
                        <div>
                            <label htmlFor="new-profile-input" >Name Profile:</label>
                            <input  onChange={props.handleInputChange} id="new-profile-input" name="new-profile-input"
                            placeholder=''
                            />
                        </div>
                        <div>
                            <label name='new-profile-token'>Choose Token:</label>
                            <input type="radio" id="FLO" name="new-profile-token" value="FLO"
                                onChange={props.handleRadioChange}
                            />
                            <label htmlFor="FLO"> &nbsp;FLO</label>
                            <input type="radio" id="RVN" name="new-profile-token" value="RVN"
                                onChange={props.handleRadioChange}
                            />
                            <label htmlFor="RVN"> &nbsp;RVN</label>
                        </div>
                    </div>
                }
                footer={true}
                submitType={'submit'}
                sendButtonTitle={'Save'}
                handleSubmit={props.handleSubmit}
    />)
}


const Profile = (props) => {
    const [profileModal, setProfileModal] = useState(false);
    const [value, setValue] = useState('') //select
    const [newProfile, setNewProfile] = useState({
        profileName: '',
        token: ''
    })

    const handleSelect = e =>{
        setValue(e.target.value)

        switch(e.target.value){
            case 'new': 
                return setProfileModal(!profileModal)
        }
    }

    const handleSubmit = e => {
        e.preventDefault();
        props.newProfile(newProfile)
    }

    console.log(newProfile)
    return (    
        <>    
            {profileModal && <NewProfile
                    handleClick={
                        () => {setProfileModal(!profileModal)
                                setValue('')}}
                    handleSubmit={(e) => handleSubmit(e)}
                    handleInputChange={(e) => setNewProfile({
                        ...newProfile,
                        profileName: e.target.value
                    })}
                    handleRadioChange={(e) => setNewProfile({
                        ...newProfile,
                        token: e.target.value
                    })}
                    />}
        <div className="card profile">
            <div className="card-body profile-container">
            <div>
            <label htmlFor="profile-select" >Active Profile:</label>
                <select name="profiles" id="profile-select" 
                    value={value}
                    onChange={(e) => handleSelect(e)}>
                <option value={''} disabled >Select profile</option>
                <option value={'new'}>
                        add new
                </option>
                </select>    
            </div>
            <div>
            <label htmlFor="profile-token" >Profile Token:</label>
                    FLO
            </div>
            <div>                
            <label htmlFor="profile-notes" >Profile Notes:</label>
                <textarea  id="profile-notes" name="profile-notes"
                    placeholder='notes'
                 />   
            </div>
            </div>
        </div>
        </>
    
)
}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    };
};


export default connect(mapStateToProps, {newProfile})(Profile)