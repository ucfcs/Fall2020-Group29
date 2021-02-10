import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.selectItem = this.selectItem.bind(this);

        let qfs = localStorage.getItem('questions'); // qfs = Questions From Storage, used to grab the string before parsing to JSON
        let questions = qfs === null ? getQuestions() : JSON.parse(qfs); // If there is nothing in storage, get Questions from DB. Otherwise, parse info from storage.

        let efs = localStorage.getItem('entities'); // efs = Entities From Storage, used to grab the string before parsing to JSON
        let entities = efs === null ? getEntities() : JSON.parse(efs); // If there is nothing in storage, get Entities from DB. Otherwise, parse info from storage.

        this.state= {
            selected:null,
            questions:questions,
            curQuestion:questions[0],
            curResponses:questions[0].responses.map(res => {
                return <Response response={res}/>
            }),
            entities:entities,
            categoryList: entities.category.map(cat => {
                return <option value={cat}>{cat}</option>
            }),
            actionList: entities.action.map(act => {
                return <option value={act}>{act}</option>
            }),
            infoList: entities.info.map(info => {
                return <option value={info}>{info}</option>
            }),
        };
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
                                    {this.state.curResponses}
                                    <div className="plus-response">
                                    +
                                    </div>
                                </div>
                            </div>
                            <div id="entity-box">
                                <h2>Associated Entities</h2>
                                <div id="entities">
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="category-choice">Category</label>
                                        <select className="entity-select" id="category-choice" >{this.state.categoryList}</select>
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="action-type-choice">Action Type</label>
                                        <select className="entity-select" id="action-type-choice">{this.state.actionList}</select>
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="information-type-choice">Information Type</label>
                                        <select className="entity-select" id="information-type-choice">{this.state.infoList}</select>
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

function getQuestions() {
    return [{name:"Question 1", responses:["Response 1"]}, {name:"Question 2", responses:["Response 2", "Response 3"]}];
}

function getEntities() {
    return {category:["BS-MS", "Foundation Exam"], action:["Sign-up", "Advisor"], info:["How", "Who", "When"]};
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