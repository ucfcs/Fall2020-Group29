import { cloneDeep, isEqual } from 'lodash';
import React from 'react';
import {confirmAlert} from 'react-confirm-alert';
import {defaultUser, getUsers, saveUser} from './users';
import SelectionBox from '../SelectionBox';
import './usersbox.css'


export class UsersBox extends React.Component {

    constructor(props) {
        super(props);

        this.hasChanges = this.hasChanges.bind(this);
        this.saveCurrent = this.saveCurrent.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.canSave = this.canSave.bind(this);
        this.handleChangeAdmin = this.handleChangeAdmin.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.state = {
            users: [],
            displayedUsers: [],
            curUser: cloneDeep(defaultUser),
            search: ''
        }
    }

    componentDidMount() {
        getUsers((users)=> {
            this.setState({users:users}, ()=> {
                this.filterSearch();
                let ufs = window.sessionStorage.getItem('previous_user');
                if (ufs !== null) {
                    this.setState({curUser:JSON.parse(ufs)});
                }
            });
        });
    }

    hasChanges() {
        if (this.state.curUser._id === '') {
            return !isEqual(this.state.curUser, defaultUser);
        } else {
            let users = this.state.users;
            let check = users.filter(user=> {
                return user._id === this.state.curUser._id;
            })[0];

            return !isEqual(this.state.curUser, check);
        }
    }

    saveCurrent(callback) {
        window.sessionStorage.setItem('previous_user', JSON.stringify(this.state.curUser));
        callback();
    }

    selectItem(event, user) {
        event.preventDefault();
        if (this.state.curUser._id !== user._id || this.state.curUser._id === '') {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>this.setState({curUser: cloneDeep(user)})
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]
                    })
            } else {
                this.setState({curUser: cloneDeep(user)});
            }
        }
    }

    handleChangeSearch(event) {
        this.setState({search:event.target.value}, ()=>this.filterSearch());
    }

    filterSearch() {
        let users = this.state.users;
        let dis = users.filter(user => {
            return user.name.toLowerCase().includes(this.state.search.toLowerCase());
        });
        this.setState({displayedUsers:dis.sort((a, b)=> a.name > b.name ? 1:-1)});
    }

    canSave() {
        return this.hasChanges();
    }

    handleChangeAdmin(event) {
        let user = this.state.curUser;
        user.IsAdmin = event.target.value === 'True'
        this.setState({curUser:user});
    }

    handleSave(event) {
        event.preventDefault();
        confirmAlert({
            title: 'Are you sure you want to save these changes?',
            message:'',
            buttons: [
                {
                    label: 'Yes, please save',
                    onClick: ()=> {
                        saveUser(this.state.curUser, (response)=> {
                            let users = this.state.users;
                            if (response.success) {
                                let check = users.filter(user=>{
                                    return user._id === response.user._id
                                })[0];
                                if (check === undefined) {
                                    users.push(response.user);
                                } else {
                                    users[users.indexOf(check)] = cloneDeep(response.user);
                                }
                                this.setState({users:users, curUser:cloneDeep(response.user)}, ()=>{
                                    this.filterSearch();
                                    window.sessionStorage.setItem('users', JSON.stringify(this.state.users));
                                    alert(response.message);
                                });
                            }
                        })
                    }
                },
                {
                    label: 'Cancel',
                    onClick: ()=> {}
                }
            ]
        });
    }

    render() {
        return (
            <>
                <div id='content-wrapper'>
                    <div id='user-selection'>
                        <div className='section-title'>
                            Users
                        </div>
                        <div id='search-bar-wrapper'>
                            <input id='search-bar' type='text' placeholder='Search' onChange={this.handleChangeSearch}/>
                        </div>
                        <div id='new-item-selection'>
                            <p className='new-user-text'>
                                Add New User
                            </p>
                            <div className='plus-select' onClick={(e)=>this.selectItem(e, defaultUser)}>
                                +
                            </div>
                        </div>
                        <div className='selection-wrapper'>
                            <SelectionBox 
                                name='users' 
                                content={this.state.displayedUsers} 
                                titles={this.state.displayedUsers.map(user=> ({
                                    title: user.name,
                                    name: user['NID']
                                }))}
                                update={this.selectItem}
                                curItem={this.state.curUser}
                            />
                        </div>
                    </div>
                    <div id='user-content-body'>
                        <div id='user-selection-header'>
                            <div id='user-title'>
                                <label id='user-label' htmlFor='user-name'>
                                    User Name
                                </label>
                                <input 
                                type='text' 
                                className='user-name' 
                                id='user-name' 
                                value={this.state.curUser.name} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let user = this.state.curUser;
                                    user.name = e.target.value;
                                    this.setState({curQuestion:user});
                                 }}
                                 />
                                 <label id='user-email-label' htmlFor='user-email'>
                                    User Email
                                </label>
                                <input 
                                type='text' 
                                className='user-email' 
                                id='user-email' 
                                value={this.state.curUser.email} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let user = this.state.curUser;
                                    user.email = e.target.value;
                                    this.setState({curQuestion:user});
                                 }}
                                 />
                                <label id='user-nid-label' htmlFor='user-nid'>
                                    User NID
                                </label>
                                <input 
                                type='text' 
                                className='user-nid' 
                                id='user-nid' 
                                value={this.state.curUser.NID} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let user = this.state.curUser;
                                    user.NID = e.target.value;
                                    this.setState({curQuestion:user});
                                 }}
                                 />
                                <label id='user-admin-label' htmlFor='user-admin'>
                                    User Is Admin
                                </label>
                                <div id='user-admin' onChange={this.handleChangeAdmin}>
                                    True <input 
                                    type='radio'
                                    name='user-admin'
                                    value='True'
                                    checked={this.state.curUser.IsAdmin}
                                    />
                                    <input 
                                    type='radio'
                                    name='user-admin'
                                    value='False'
                                    checked={!this.state.curUser.IsAdmin}
                                    /> False
                                </div>
                            </div>
                            
                            <div id='user-save'>
                                <div 
                                    className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                    onClick={this.handleSave}
                                >
                                    Save Changes
                                </div>
                            </div>
                        </div>
                        <div id='user-content'>

                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default UsersBox;