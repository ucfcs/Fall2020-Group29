import React from 'react';
import SelectionBox from '../SelectionBox';
import {statTypes} from './stats';
import './statsbox.css';


export class StatsBox extends React.Component {

    constructor(props) {
        super(props);

        this.saveCurrent = this.saveCurrent.bind(this);
        this.hasChanges = this.hasChanges.bind(this);
        this.selectStat = this.selectStat.bind(this);

        this.state={
            curStat:{
                _id:'',
                name:''
            }
        };
    }

    saveCurrent(callback) {
        callback();
    }

    hasChanges() {
        return false;
    }

    selectStat(event, stat) {
        event.preventDefault();
        this.setState({curStat:stat});
    }

    render() {
        return(
            <>
                <div id='content-wrapper'>
                    <div id='stats-selection'>
                        <div id='stat-type-selection'>
                            <div className='section-title'>
                                Stat Type
                            </div>
                            <div className='selection-wrapper'>
                                <SelectionBox 
                                name='Stat Type'
                                content={statTypes}
                                titles={statTypes.map(stat=> ({
                                    title:stat.name,
                                    name:''
                                }))}
                                update={this.selectStat}
                                curItem={this.state.curStat}
                                />
                            </div>
                        </div>
                    </div>
                    <div id='stat-content-body'>

                    </div>
                </div>
            </>
        );
    }
}

export default StatsBox;