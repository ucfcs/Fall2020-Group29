import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';
import {getQuestions, getTags} from './questions';
import Select from 'react-select';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.selectItem = this.selectItem.bind(this);
        this.changeResponse = this.changeResponse.bind(this);
        this.deleteResponse = this.deleteResponse.bind(this);
        this.addResponse = this.addResponse.bind(this);
        this.changePattern = this.changePattern.bind(this);
        this.addPattern = this.addPattern.bind(this);
        this.handleSelectTag = this.handleSelectTag.bind(this);

        let qfs = window.sessionStorage.getItem("questions"); // qfs = Questions From Storage, used to grab the string before parsing to JSON

        let tfs = window.sessionStorage.getItem("tags"); // tfs = Tags From Storage, used to grab the string before parsing to JSON

        this.state= {
            selected:null,
            questions:qfs === null ? [] : JSON.parse(qfs),
            curQuestion:qfs === null ? {
                "id": null,
                "name": "",
                "responses": [],
                "patterns": [],
                "tags": {
                    "intent": "",
                    "department": "",
                    "category": "",
                    "information": ""
                }
            } : JSON.parse(qfs)[0],
            tags:tfs === null ? [] : JSON.parse(tfs),

            intentList: [],
            categoryList: [],
            departmentList: [],
            infoList: [],
        };
    }

    /* 
    Function is used to acquire the questions and tags for the system on the first load of the session.
    
    */
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

        if (this.state.tags.length === 0) {
            getTags((tags)=> {
                this.setState({tags:tags}, ()=> {
                    window.sessionStorage.setItem("tags", JSON.stringify(this.state.tags));
                    this.setState({
                        intentList: this.state.tags.intents.map(int => ({
                             "value":int.toLowerCase(),
                             "label":int
                        })),
                        departmentList: this.state.tags.entities.department.map(dept => ({
                            "value":dept.toLowerCase(),
                            "label":dept
                        })),
                        categoryList: this.state.tags.entities.category.map(cat => ({
                            "value":cat.toLowerCase(),
                            "label":cat
                        })),
                        infoList: this.state.tags.entities.info.map(info => ({
                            "value":info.toLowerCase(),
                            "label":info
                        }))
                    })
                })
            })
        } else {
            this.setState({
                intentList: this.state.tags.intents.map(int => ({
                    "value":int.toLowerCase(),
                    "label":int
                })),
                departmentList: this.state.tags.entities.department.map(dept => ({
                   "value":dept.toLowerCase(),
                   "label":dept
                })),
                categoryList: this.state.tags.entities.category.map(cat => ({
                   "value":cat.toLowerCase(),
                   "label":cat
                })),
                infoList: this.state.tags.entities.info.map(info => ({
                   "value":info.toLowerCase(),
                   "label":info
                }))
            });
        }
    }

    changeResponse(event, num) {
        event.preventDefault();
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

    addResponse(event) {
        event.preventDefault();
        let question = this.state.curQuestion;
        question.responses.push("");
        this.setState({curQuestion:question});
    }

    changePattern(event, num) {
        event.preventDefault();
        let question = this.state.curQuestion;
        let patterns = question.patterns;
        patterns[num] = event.target.value;
        question.patterns = patterns;
        this.setState({curQuestion:question});
    }

    addPattern(event) {
        event.preventDefault();
        let question = this.state.curQuestion;
        question.patterns.push("");
        this.setState({curQuestion:question});
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.selected !== event.target) {
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
                console.log(this.state.curQuestion.id);
                console.log(this.state.curQuestion.tags)
            });
        }
    }

    handleSelectTag(e, tag) {
        let question = this.state.curQuestion;
        question.tags[tag] = e.label;
        this.setState({curQuestion:question})
    }

    
    render () {
        return (
            <>
                <div id="content-wrapper">
                    <div id="selection-wrapper">
                        <div className="section-title">
                            <h1>Questions</h1>
                        </div>
                        <div id="search-bar">
                            <input type="text" placeholder="Search" />
                        </div>
                        <SelectionBox 
                        name="questions" 
                        content={this.state.questions} 
                        update={this.selectItem} 
                        />
                        <div id="new-question-selection">
                            <p className="new-question-text">
                                Add New Question
                            </p>
                            <div className="plus-select">
                                +
                            </div>
                        </div>
                    </div>
                    <div id="content">
                        <div id="selection-header">
                            <label id="question-label" htmlFor="question-name">
                                Question Name
                            </label>
                            <input 
                            type="text" 
                            className="question-name" 
                            id="question-name" 
                            value={this.state.curQuestion.name} 
                            onChange={(e)=>{
                                e.preventDefault();
                                let question = this.state.curQuestion;
                                question.name = e.target.value;
                                this.setState({curQuestion:question}, ()=>console.log(this.state.curQuestion));
                             }}
                             />
                            {/* <div className="button save-button">Save Changes</div>
                            <div className="button delete-button">Delete Question</div> */}
                        </div>
                        <div id="question-content">
                            <div id="entity-box">
                                <h2>Tags</h2>
                                <div id="entities">
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="intent-choice">
                                            Intent
                                        </label>
                                        <Select 
                                        className="entity-select"
                                        id="intent-choice" 
                                        value={{
                                            value:this.state.curQuestion.tags.intent.toLowerCase(),
                                            label:this.state.curQuestion.tags.intent
                                        }}
                                        options={this.state.intentList} 
                                        onChange={(e)=>this.handleSelectTag(e, "intent")}
                                        />
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="department-choice">
                                            Department
                                        </label>
                                        <Select 
                                        className="entity-select" 
                                        id="department-choice" 
                                        value={{
                                            value:this.state.curQuestion.tags.department.toLowerCase(),
                                            label:this.state.curQuestion.tags.department
                                        }}
                                        options={this.state.departmentList} 
                                        onChange={(e)=>this.handleSelectTag(e, "department")}
                                        />
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="category-choice">
                                            Category
                                        </label>
                                        <Select 
                                        className="entity-select" 
                                        id="category-choice"
                                        value={{
                                            value:this.state.curQuestion.tags.category.toLowerCase(),
                                            label:this.state.curQuestion.tags.category
                                        }}
                                        options={this.state.categoryList} 
                                        onChange={(e)=>this.handleSelectTag(e, "category")}
                                        />
                                    </div>
                                    <div className="entity-selection-box">
                                        <label className="entity-label" htmlFor="information-choice">
                                            Information
                                        </label>
                                        <Select 
                                        className="entity-select" 
                                        id="information-choice"
                                        value={{
                                            value:this.state.curQuestion.tags.information.toLowerCase(),
                                            label:this.state.curQuestion.tags.information
                                        }}
                                        options={this.state.infoList} 
                                        onChange={(e)=>this.handleSelectTag(e, "information")}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div id="entered-fields">
                                <div id="patterns-and-responses">
                                    <div id="response-box">
                                        <h2>Responses to Question</h2>
                                        <div className="responses">
                                            {this.state.curQuestion.length === 0 ? "":
                                            this.state.curQuestion.responses.map((res, index) => {
                                                return <Response 
                                                num={index} 
                                                response={res} 
                                                change={this.changeResponse} 
                                                />
                                            })}
                                            <div className="plus" onClick={this.addResponse}>
                                            +
                                            </div>
                                        </div>
                                    </div>
                                    <div id="patterns-box">
                                        <h2>Patterns</h2>
                                        <div className="patterns">
                                            {this.state.curQuestion.length === 0 ? "":
                                            this.state.curQuestion.patterns.map((pat, index) => {
                                                return <Pattern 
                                                num={index} 
                                                pattern={pat} 
                                                change={this.changePattern} 
                                                />
                                            })}
                                            <div className="plus" onClick={this.addPattern}>
                                            +
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="contacts-and-forms">
                                    <div id="contacts-box">
                                        <h2>Contacts</h2>
                                        <div className="contacts field-box">
                                            <Select 
                                            type="text" 
                                            className="contact field" 
                                            id="contact-1"
                                            />
                                            <Select 
                                            type="text" 
                                            className="contact field" 
                                            id="contact-2"
                                            />
                                        </div>
                                    </div>
                                    <div id="documents-box">
                                        <h2>Documents</h2>
                                        <div className="documents field-box">
                                            <input 
                                            type="text" 
                                            className="document field" 
                                            id="document-1" 
                                            placeholder="Document" 
                                            />
                                            <input 
                                            type="text" 
                                            className="document field" 
                                            id="document-2" 
                                            placeholder="Document" 
                                            />
                                        </div>
                                    </div>
                                    <div id="follow-up-box">
                                        <h2>Follow Up Questions</h2>
                                        <div className="follow-ups field-box">
                                            <input 
                                            type="text" 
                                            className="follow-up field" 
                                            id="follow-up-1" 
                                            placeholder="Follow Up Question" 
                                            />
                                            <input 
                                            type="text" 
                                            className="follow-up field" 
                                            id="follow-up-2" 
                                            placeholder="Follow Up Question" 
                                            />
                                        </div>
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
            <input 
            type="text" 
            className="response-text" 
            placeholder="New Response" 
            num={props.num} 
            value={props.response} 
            onChange={(event)=>props.change(event, props.num)}
            />
        </div>
    );
}

function Pattern(props) {
    return(
        <div className="pattern">
            <input 
            type="text" 
            className="pattern-text" 
            placeholder="New Pattern" 
            num={props.num} 
            value={props.pattern} 
            onChange={(event)=>props.change(event, props.num)}
            />
        </div>
    );
}