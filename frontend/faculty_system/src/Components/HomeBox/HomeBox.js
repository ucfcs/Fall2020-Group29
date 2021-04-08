import React from 'react';
import { ContentBox } from './ContentBox/boxes';
import {retrain, logOut} from './home'
import {confirmAlert} from 'react-confirm-alert';
import './homebox.css';

export class HomeBox extends React.Component {

    constructor(props) {
        super(props);

        this.changeSelected = this.changeSelected.bind(this);
        this.handleRetrain = this.handleRetrain.bind(this);
        this.handleUpdateTrain = this.handleUpdateTrain.bind(this);

        this.state = {
            selection: 'navbox-questions',
            selectedNode: '',
            needsTraining: 'Fully Trained'
        }
    }

    changeSelected(event) {

        event.preventDefault();
        console.log(this.state.selectedNode);
        

        let item = this.state.selectedNode;
        if (item === '') {
            item = document.getElementById('navbox-questions')
        }
        this.setState({selection:event.target.id, selected:event.target});        
    }

    handleRetrain(event) {
        event.preventDefault();
        if (this.state.needsTraining === 'Needs Training') {
            confirmAlert({
                title: 'Do you want to retrain the system?',
                message: '',
                buttons: [
                    {
                        label: 'Yes, retrain',
                        onClick: ()=>{
                            this.setState({needsTraining:'Training Now'}, ()=>{
                                retrain((res)=> {
                                    alert(res.message);
                                    if (res.trained) {
                                        this.setState({needsTraining:'Fully Trained'});
                                    } else {
                                        this.setState({needsTraining:'Needs Training'});
                                    }
                                });
                            }); 
                        }
                    },
                    {
                        label: 'No, don\'t retrain yet',
                        onClick: ()=>{}
                    }
                ]
            })      
        }
    }

    handleUpdateTrain(value) {
        this.setState({needsTraining:value});
    }

    render() {
        return (
            <div id='home-box'>
                <div id='sidebox'>
                    <div id='navbar'>
                        <div id='nav-header'>
                        </div>
                        <NavBox 
                            sectionName='Questions' 
                            selected={this.state.selection === 'navbox-questions'}  
                            clicked={this.changeSelected}
                        />
                        <NavBox 
                            sectionName='Tags' 
                            selected={this.state.selection === 'navbox-tags'} 
                            clicked={this.changeSelected} 
                        />
                        <NavBox 
                            sectionName='Contacts' 
                            selected={this.state.selection === 'navbox-contacts'} 
                            clicked={this.changeSelected} 
                        />
                        <NavBox 
                            sectionName='Documents' 
                            selected={this.state.selection === 'navbox-documents'} 
                            clicked={this.changeSelected} 
                        />
                        <NavBox 
                            sectionName='Users' 
                            selected={this.state.selection === 'navbox-users'} 
                            clicked={this.changeSelected} 
                        />
                        <NavBox 
                            sectionName='Statistics' 
                            selected={this.state.selection === 'navbox-statistics'} 
                            clicked={this.changeSelected} 
                        />
                    </div>
                    <div 
                        className={'button train-button ' + ({
                            'Needs Training': 'need-training',
                            'Training Now': 'training',
                            'Fully Trained': 'trained'
                        }[this.state.needsTraining])}
                        onClick={this.handleRetrain}
                    >
                        {this.state.needsTraining}
                    </div>
                    <div id='log-out' className='button log-out-button' onClick={(event)=>{event.preventDefault();logOut();}}>
                        Log Out
                    </div>
                </div>
                <ContentBox selection={this.state.selection} updateTrain={this.handleUpdateTrain}/>
            </div>
        );
    }
}

export default HomeBox;

function NavBox(props) {
    return (
        <div className={props.selected === true ? 'navbox selected' : 'navbox'}
         id={'navbox-'+props.sectionName.toLowerCase()} onClick={(event)=>props.clicked(event)}>
            {props.sectionName}
        </div>
    );
}