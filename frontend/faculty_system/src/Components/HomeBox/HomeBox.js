import React from 'react';
import { ContentBox } from './ContentBox/boxes';
import {sections, retrain, logOut} from './home'
import {confirmAlert} from 'react-confirm-alert';
import './homebox.css';

export class HomeBox extends React.Component {

    constructor(props) {
        super(props);
        this.contentRef = React.createRef();

        this.hasChanges = this.hasChanges.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleSelected = this.handleSelected.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
        this.handleRetrain = this.handleRetrain.bind(this);
        this.handleUpdateTrain = this.handleUpdateTrain.bind(this);

        this.state = {
            selection: 'navbox-questions',
            selectedNode: '',
            needsTraining: 'Fully Trained'
        }
    }

    hasChanges() {
        return this.contentRef.current.hasChanges();
    }

    handleLogout(event) {
        event.preventDefault();
        console.log(this.hasChanges());
        if (this.hasChanges()) {
            confirmAlert({
                title:"You have unsaved changes",
                message: "Do you want to leave without saving your changes?",
                buttons: [
                    {
                        label: "Yes",
                        onClick: ()=> logOut()
                    },
                    {
                        label: "No",
                        onClick: ()=>{}
                    }
                ]});
        } else {
            logOut();
        }
    }

    handleSelected(event) {
        event.preventDefault();
        console.log(this.hasChanges());
        if (this.hasChanges()) {
            confirmAlert({
                title:"You have unsaved changes",
                message: "Do you want to leave without saving your changes?",
                buttons: [
                    {
                        label: "Yes",
                        onClick: ()=> this.changeSelected(event.target.id, event.target)
                    },
                    {
                        label: "No",
                        onClick: ()=>{}
                    }
                ]});
        } else {
            this.changeSelected(event.target.id, event.target)
        }       
    }

    changeSelected(id, target) {
        let item = this.state.selectedNode;
            if (item === '') {
                item = document.getElementById('navbox-questions')
            }
            this.setState({selection:id, selected:target});
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
                        {sections.map(section=>
                            <NavBox 
                                sectionName={section} 
                                selected={this.state.selection === ('navbox-'+(section.toLowerCase()))}
                                clicked={this.handleSelected}
                            />
                        )}
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
                    <div id='log-out' className='button log-out-button' onClick={this.handleLogout}>
                        Log Out
                    </div>
                </div>
                <ContentBox ref={this.contentRef} selection={this.state.selection} updateTrain={this.handleUpdateTrain}/>
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