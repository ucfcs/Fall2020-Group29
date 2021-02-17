import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';
import {getQuestions, getEntities} from "./questions"
import { useState } from 'react';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.selectItem = this.selectItem.bind(this);
        this.changeResponse = this.changeResponse.bind(this);
        this.deleteResponse = this.deleteResponse.bind(this);

        let qfs = window.sessionStorage.getItem("questions"); // qfs = Questions From Storage, used to grab the string before parsing to JSON

        let efs = sessionStorage.getItem("entities"); // efs = Entities From Storage, used to grab the string before parsing to JSON

        this.state= {
            selected:null,
            questions:qfs === null ? [] : JSON.parse(qfs),
            curQuestion:[],
            curResponses:[],
            entities:efs === null ? [] : JSON.parse(efs),
            
            actionList: [],
            categoryList: [],
            infoList: [],
        };
    }

    componentDidMount() {
        if (this.state.questions.length === 0) {
            console.log("No questions");
            getQuestions((questions)=> {
                console.log(questions);
                this.setState({questions:questions}, ()=> {
                window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                this.setState({
                    curQuestion: this.state.questions[0]}, console.log(this.state.curQuestion));
            });

            })
            
        }

        if (this.state.entities.length === 0) {
            getEntities((entities)=> {
                this.setState({entities:entities}, ()=> {
                    this.setState({
                        actionList: this.state.entities.action.map(act => {
                            return <option value={act}>{act}</option>
                        }),categoryList: this.state.entities.category.map(cat => {
                            return <option value={cat}>{cat}</option>
                        }),
                        infoList: this.state.entities.info.map(info => {
                            return <option value={info}>{info}</option>
                        })
                    })
                })
            })
        }
    }

    changeResponse(event, num) {
        event.preventDefault();
        console.log(num);
        let question = this.state.curQuestion;
        let responses = question.responses;
        responses[num] = event.target.value;
        question.responses = responses;
        this.setState({curQuestion:question});
    }

    deleteResponse(event, num) {
        event.preventDefault();
        if (window.confirm("Are you sure you want to delete this response?")) {
            let question = this.state.curQuestion;
            question.responses.splice(num, 1);
            this.setState({curQuestion:question});
        }
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.selected !== null) {
            this.state.selected.setAttribute('src', arrowB);
            let selectedParent = this.state.selected.parentNode;
            selectedParent.parentNode.className = "selection-option";
        }

        this.setState({
             selected: event.target,
             curQuestion: item}, ()=> {
            let parent = event.target.parentNode;
            event.target.setAttribute('src', arrowG);
            parent.parentNode.className = "selected-option";
        });
        
    }

    
    render () {
        return (
            <>
                <div id="search-bar">
                    <div className="section-title">
                        Questions
                    </div>
                </div>
                <div id="content-wrapper">
                    <div id="selection-wrapper">
                        <SelectionBox name="questions" 
                         content={this.state.questions}
                         update={this.selectItem} />
                        <div id="new-question-selection">
                            <p className="new-question-text">Add New Question </p>
                            <div className="plus-select">
                                +
                            </div>
                        </div>
                    </div>
                    <div id="content">
                        <div id="selection-header">
                            Question Name: 
                            <input type="text" className="question-name" id="question-name" value={this.state.curQuestion.name} onChange={(e)=>{
                                e.preventDefault();
                                let question = this.state.curQuestion;
                                question.name = e.target.value;
                                this.setState({curQuestion:question}, ()=>console.log(this.state.curQuestion));
                             }}/>
                            <div className="button save-button">Save Changes</div>
                            <div className="button delete-button">Delete Question</div>
                        </div>
                        <div id="question-content">
                            <div id="response-box">
                                <h2>Responses to Question</h2>
                                <div className="responses">
                                    {this.state.curQuestion.length === 0 ? "":this.state.curQuestion.responses.map((res, index) => {
                                        return <Response num={index} response={res} change={this.changeResponse} del={this.deleteResponse}/>
                                            })}
                                    <div className="plus-response">
                                    +
                                    </div>
                                </div>
                            </div>
                            <div id="entity-box">
                                <h2>Associated Entities</h2>
                                <div id="entities">
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="department-choice">Department</label>
                                        <select className="entity-select" id="department-choice" >{this.state.categoryList}</select>
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="category-choice">Category</label>
                                        <select className="entity-select" id="category-choice">{this.state.actionList}</select>
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="information-choice">Information</label>
                                        <select className="entity-select" id="information-choice">{this.state.infoList}</select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default QuestionsBox;



function Response(props) {

    return(
        <div className="response">
            <input type="text" className="response-text" num={props.num} value={props.response} onChange={(event)=>props.change(event, props.num)}/>
            <div className="response-delete" onClick={(event)=>props.del(event, props.num)}>
                X
            </div>
        </div>
    );
}