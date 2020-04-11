import React, {useState, useEffect} from 'react';
import Modal from '../../../helpers/modal';
import { connect } from 'react-redux';
import { newProfile, updateProfile } from '../../../../actions/profileActions'
import ActiveRentals from './ActiveRentals';
import RenderError from '../../../helpers/errors';




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
                    {props.error && <RenderError message={props.error} />}
                    </div>
                }
                footer={true}
                submitType={'submit'}
                sendButtonTitle={'Save'}
                handleSubmit={props.handleSubmit}
    />)
}


const Profile = (props) => {

    const {profiles} = props;

    const [profileModal, setProfileModal] = useState(false);
    const [value, setValue] = useState('') //select
    const [newProfile, setNewProfile] = useState({
        name: '',
        token: '',
    })
    const [notes, setNotes] = useState('')
    const [selectedProfile, setSelectedProfile] = useState({});
    const [error, setError] = useState(null);
    const [blur, setBlur] = useState(false);
    const [focus, setFocus] = useState(false);


    useEffect(() => {
        if(profiles) {
            let profile = profiles.find(obj => { return obj.name == value})
            setSelectedProfile(profile)
        }
    }, [profiles, value])

    useEffect(() => {
        if(blur && focus && (notes !== '')){
            console.log('running update', notes)
            console.log(selectedProfile)
            props.updateProfile(selectedProfile)
            setBlur(!blur)
            setFocus(!focus)
        }
    })


    const handleSelect = e =>{
        setValue(e.target.value)

        switch(e.target.value){
            case 'new': 
                return setProfileModal(!profileModal)
        }
    }

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await props.newProfile(newProfile)

        console.log(res)
        if(res.status === 400){
            setError(res.data.error)
        }
        
        if(res.status === 200){
            setProfileModal(!profileModal)
            setValue(newProfile.name)
        }        

    }

    const Dropdown = () => {

        if(!profiles) return null;

        return profiles.map((profile, i) => {
        return ( 
            <option value={profile.name} key={i}>
                    {profile.name}
            </option>)  
    })
}

    return (    
        <>    
            {profileModal && <NewProfile
                    handleClick={
                        () => {setProfileModal(!profileModal)
                                setValue('')}}
                    handleSubmit={(e) => handleSubmit(e)}
                    handleInputChange={(e) => {setNewProfile({
                        ...newProfile,
                        name: e.target.value
                    }) 
                        setError(null)
                        }
                    }
                    handleRadioChange={(e) => setNewProfile({
                        ...newProfile,
                        token: e.target.value
                    })}
                    error={error}
                    />}
        <div className="card profile">
            <div className="card-body profile-container">
            <div style={{marginBottom: '1rem'}}>
            <label htmlFor="profile-select" >Active Profile:</label>
                <select name="profiles" id="profile-select" 
                    value={value}
                    onChange={(e) => handleSelect(e)}>
                <option value={''} disabled >Select profile</option>
                <Dropdown />
                <option value={'new'}>
                        add new
                </option>
                </select>    
            </div>
            <div style={{marginBottom: '1rem'}}>
            <label htmlFor="profile-token" >Profile Token:</label>
                    FLO
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>                
            <label htmlFor="profile-notes" >Profile Notes:</label>
                <textarea  id="profile-notes" name="profile-notes"
                    placeholder='notes'
                    onChange={(e) =>  {setNotes(e.target.value)
                        setSelectedProfile({...selectedProfile, notes: e.target.value})
                        }
                    }
                    onFocus={e => setFocus(!focus)}
                    onBlur={e => setBlur(!blur)}
                />   
            </div>
            </div>
        </div>
        <ActiveRentals profile={selectedProfile} />
        </>
    
)
}

const mapStateToProps = state => {
    return {
        profiles: state.profiles.profileList
    };
};


export default connect(mapStateToProps, {newProfile, updateProfile})(Profile)