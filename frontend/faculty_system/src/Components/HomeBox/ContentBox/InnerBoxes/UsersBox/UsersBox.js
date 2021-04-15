import React from 'react';


export class UsersBox extends React.Component {

    constructor(props) {
        super(props);

        this.hasChanges = this.hasChanges.bind(this);
        this.saveCurrent = this.saveCurrent.bind(this);
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
                    
                </div>
            </>
        );
    }

}

export default UsersBox;