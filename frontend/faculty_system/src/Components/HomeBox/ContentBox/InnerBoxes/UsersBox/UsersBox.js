import { cloneDeep } from 'lodash';
import React from 'react';
import {confirmAlert} from 'react-confirm-alert';
import {defaultUser, getUsers} from './users';
import SelectionBox from '../SelectionBox';
import './usersbox.css'


export class UsersBox extends React.Component {

    constructor(props) {
        super(props);

        this.hasChanges = this.hasChanges.bind(this);
        this.saveCurrent = this.saveCurrent.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.filterSearch = this.filterSearch.bind(this);

        this.state = {
            users: [],
            displayedUsers: [],
            curUser: cloneDeep(defaultUser)
        }
    }

    componentDidMount() {
        getUsers((users)=> {
            this.setState({users:users, displayedUsers:users}, ()=>console.log(this.state.users));
        });
    }

    hasChanges() {
        return false;
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

    filterSearch(event) {

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
                            <input id='search-bar' type='text' placeholder='Search' onChange={this.filterSearch}/>
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

                    </div>
                </div>
            </>
        );
    }

}

export default UsersBox;