import { cloneDeep } from 'lodash';
import React from 'react';
import {defaultUser, getUsers} from './users';


export class UsersBox extends React.Component {

    constructor(props) {
        super(props);

        this.hasChanges = this.hasChanges.bind(this);
        this.saveCurrent = this.saveCurrent.bind(this);

        this.state = {
            users: [],
            curUser: cloneDeep(defaultUser)
        }
    }

    componentDidMount() {
        getUsers((users)=> {
            this.setState({users:users}, ()=>console.log(this.state.users));
        });
    }

    hasChanges() {
        return false;
    }

    saveCurrent(callback) {
        callback();
    }

    render() {
        return (
            <>
                <div id='content-wrapper'>
                    <div id='user-selection'>

                    </div>
                    <div id='user-content-body'>

                    </div>
                </div>
            </>
        );
    }

}

export default UsersBox;