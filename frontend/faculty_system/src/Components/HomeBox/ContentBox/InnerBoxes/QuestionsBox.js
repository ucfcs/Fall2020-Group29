import React from 'react';
import SelectionBox from './SelectionBox';
import './questionsbox.css';
import arrowB from './images/sidearrow_b.png';
import arrowG from './images/sidearrow_g.png';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        let questions = null;
        this.selectItem = this.selectItem.bind(this);
        let qfs = localStorage.getItem('questions'); // qfs = Questions From Storage, used to grab the string before parsing to JSON
        if (qfs === null) {
            questions = getQuestions();
        } else {
            questions = JSON.parse(qfs);
        }
        this.state= {
            selected:null,
            questions:questions,
            curQuestion:questions[0],
            curResponses:questions[0].responses.map(res => {
                return <Response response={res}/>
            })
        };
        console.log(this.state.questions);
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
             curQuestion: item,
             curResponses:item.responses.map(res => {
                return <Response response={res}/>
             })}, ()=> {
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
                            Question Name: <input type="text" className="question-name" id="question-name" value={this.state.curQuestion.name}/>
                        </div>
                        <div id="question-content">
                            <div id="response-box">
                                <div className="responses">
                                    {this.state.curResponses}
                                    <div className="plus-response">
                                    +
                                    </div>
                                </div>
                            </div>
                            <div id="entity-box">

                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default QuestionsBox;

function getQuestions() {
    return [{name:"Question 1", responses:["Response 1"]}, {name:"Question 2", responses:["Response 2", "Response 3"]}]
}

function Response(props) {

    return(
        <div className="response">
            <input type="text" className="response-text" value={props.response}/>
            <div className="response-delete">
                X
            </div>
        </div>
    );
}