import React from 'react';


export class StatsBox extends React.Component {

    constructor(props) {
        super(props);

        this.saveCurrent = this.saveCurrent.bind(this);
        this.hasChanges = this.hasChanges.bind(this);

        this.state={

        };
    }

    saveCurrent(callback) {
        callback();
    }

    hasChanges() {
        return false;
    }

    render() {
        return(
            <>
            </>
        );
    }
}

export default StatsBox;