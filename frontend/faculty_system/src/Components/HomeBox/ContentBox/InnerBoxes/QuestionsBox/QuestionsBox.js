import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';
import {getQuestions} from './questions';
import {getTags} from '../TagsBox/tags';
import {getContacts} from '../ContactsBox/contacts';
import {getDocuments} from '../DocumentsBox/documents';
import Select from 'react-select';
import {cloneDeep} from 'lodash';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.selectItem = this.selectItem.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.changeResponse = this.changeResponse.bind(this);
        this.deleteResponse = this.deleteResponse.bind(this);
        this.addResponse = this.addResponse.bind(this);
        this.changePattern = this.changePattern.bind(this);
        this.addPattern = this.addPattern.bind(this);
        this.handleSelectTag = this.handleSelectTag.bind(this);
        this.handleSelectFollowUp = this.handleSelectFollowUp.bind(this);
        this.makeOptions = this.makeOptions.bind(this);

        this.state = {
            selected:null,
            questions:[],
            displayedQuestions:[],
            curQuestion:{
                'id': -1,
                'name': '',
                'responses': [],
                'patterns': [],
                'tags': {
                    'intent': '',
                    'department': '',
                    'category': '',
                    'information': ''
                }
            },
            tags:{
                'intents': [],
                'entities': {
                    'category': [],
                    'department': [],
                    'information': []
                }
            },

            intentList: [],
            categoryList: [],
            departmentList: [],
            infoList: [],

            documents:[],
            contacts:[]
        };
    }

    /* 
    Function is used to acquire the questions and tags for the system on the first load of the session.
    
    */
    componentDidMount() {

        getQuestions((questions)=> {
            console.log(questions);
            this.setState({
                questions:questions,
                displayedQuestions:questions,
                curQuestion: cloneDeep(questions[0])
            });
        });

        getTags((tags)=> {
            this.setState({tags:tags}, ()=> {
                this.setState({
                    intentList: this.state.tags.intents.map(int => ({
                         'value':int.id,
                         'label':int.name
                    })),
                    departmentList: this.state.tags.entities.department.map(dept => ({
                         'value':dept.id,
                         'label':dept.name
                    })),
                    categoryList: this.state.tags.entities.category.map(cat => ({
                         'value':cat.id,
                         'label':cat.name
                    })),
                    infoList: this.state.tags.entities.information.map(info => ({
                         'value':info.id,
                         'label':info.name
                    }))
                })
            })
        });

        getContacts((contacts)=> this.setState({contacts:contacts}));

        getDocuments((documents)=> this.setState({documents:documents}));
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.selected !== event.target) {
            if (this.state.selected !== null) {
                this.state.selected.setAttribute('src', arrowB);
                let selectedParent = this.state.selected.parentNode;
                selectedParent.parentNode.className = 'selection-option';
            }

            this.setState({
             selected: event.target,
             curQuestion: cloneDeep(item)}, ()=> {
                let parent = event.target.parentNode;
                event.target.setAttribute('src', arrowG);
                parent.parentNode.className = 'selected-option';
            });
        }
    }

    filterSearch(event) {
        // let questions = this.state.questions;
        // let dis = questions.filter(q=> {
        //     let contained = q.name.toLowercase().contains(event.target.value.toLowercase())
        //     if (!contained) {
        //         q.responses.forEach(r=> {

        //         })
        //     } else {
        //         return contained;
        //     }
        // })
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
        if (window.confirm('Are you sure you want to delete this response?')) {
            let question = this.state.curQuestion;
            question.responses.splice(num, 1);
            this.setState({curQuestion:question});
        }
    }

    addResponse(event) {
        event.preventDefault();
        let question = this.state.curQuestion;
        question.responses.push('');
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
        question.patterns.push('');
        this.setState({curQuestion:question});
    }

    handleSelectTag(e, tag) {
        let question = this.state.curQuestion;
        question.tags[tag] = e.value;
        this.setState({curQuestion:question})
    }

    handleSelectFollowUp(e) {
        let question = this.state.curQuestion;
        question['follow-up'] = e.value;
        console.log(e.value);
        this.setState({curQuestion:question})
    }

    makeOptions(values) {
        let options = values.map(val=> ({
            value:val.id,
            label:val.name   
        }));
        options.unshift({value:0,label:'None'});
        return options
    }
    
    render () {
        return (
            <>
                <div id='content-wrapper'>
                    <div id='selection-wrapper'>
                        <div className='section-title'>
                            Questions
                        </div>
                        <div id='search-bar'>
                            <input type='text' placeholder='Search' onChange={this.filterSearch}/>
                        </div>
                        <SelectionBox 
                        name='questions' 
                        content={this.state.displayedQuestions} 
                        titles={this.state.displayedQuestions.map(q=> ({
                            title:`${q.tags.department}:${q.tags.category}:${q.tags.information}`,
                            name: q.name
                            
                        }))}
                        update={this.selectItem} 
                        />
                        <div id='new-question-selection'>
                            <p className='new-question-text'>
                                Add New Question
                            </p>
                            <div className='plus-select'>
                                +
                            </div>
                        </div>
                    </div>
                    <div id='content'>
                        <div id='selection-header'>
                            <label id='question-label' htmlFor='question-name'>
                                Question Name
                            </label>
                            <input 
                            type='text' 
                            className='question-name' 
                            id='question-name' 
                            value={this.state.curQuestion.name} 
                            onChange={(e)=>{
                                e.preventDefault();
                                let question = this.state.curQuestion;
                                question.name = e.target.value;
                                this.setState({curQuestion:question});
                             }}
                             />
                            {/* <div className='button save-button'>Save Changes</div>
                            <div className='button delete-button'>Delete Question</div> */}
                        </div>
                        <div id='question-content'>
                            <div id='entity-box'>
                                <h2>Tags</h2>
                                <div id='entities'>
                                    <div className='entity-selection-box'>
                                        <label className='entity-label' htmlFor='intent-choice'>
                                            Intent
                                        </label>
                                        <Select 
                                        className='entity-select'
                                        id='intent-choice' 
                                        value={({
                                            value:(()=> {
                                                let tag = this.state.tags.intents.filter(t=>
                                                t.name === this.state.curQuestion.tags.intent)[0]
                                                return tag === undefined ? '':tag.id
                                            })(),
                                            label:this.state.curQuestion.tags.intent
                                        })}
                                        options={this.state.intentList} 
                                        onChange={(e)=>this.handleSelectTag(e, 'intent')}
                                        />
                                    </div>
                                    <div className='entity-selection-box'>
                                        <label className='entity-label' htmlFor='department-choice'>
                                            Department
                                        </label>
                                        <Select 
                                        className='entity-select' 
                                        id='department-choice' 
                                        value={{
                                            value:(()=> {
                                                let tag = this.state.tags.entities.department.filter(t=>
                                                t.name === this.state.curQuestion.tags.department)[0]
                                                return tag === undefined ? '':tag.id
                                            })(),
                                            label:this.state.curQuestion.tags.department
                                        }}
                                        options={this.state.departmentList} 
                                        onChange={(e)=>this.handleSelectTag(e, 'department')}
                                        />
                                    </div>
                                    <div className='entity-selection-box'>
                                        <label className='entity-label' htmlFor='category-choice'>
                                            Category
                                        </label>
                                        <Select 
                                        className='entity-select' 
                                        id='category-choice'
                                        value={{
                                            value:(()=> {
                                                let tag = this.state.tags.entities.category.filter(t=>
                                                t.name === this.state.curQuestion.tags.category)[0]
                                                return tag === undefined ? '':tag.id
                                            })(),
                                            label:this.state.curQuestion.tags.category
                                        }}
                                        options={this.state.categoryList} 
                                        onChange={(e)=>this.handleSelectTag(e, 'category')}
                                        />
                                    </div>
                                    <div className='entity-selection-box'>
                                        <label className='entity-label' htmlFor='information-choice'>
                                            Information
                                        </label>
                                        <Select 
                                        className='entity-select' 
                                        id='information-choice'
                                        value={{
                                            value:(()=> {
                                                let tag = this.state.tags.entities.information.filter(t=>
                                                t.name === this.state.curQuestion.tags.information)[0]
                                                return tag === undefined ? '':tag.id
                                            })(),
                                            label:this.state.curQuestion.tags.information
                                        }}
                                        options={this.state.infoList} 
                                        onChange={(e)=>this.handleSelectTag(e, 'information')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div id='entered-fields'>
                                <div id='patterns-and-responses'>
                                    <div id='response-box'>
                                        <h2>Responses to Question</h2>
                                        <div className='responses'>
                                            {this.state.curQuestion.responses.map((res, index) => {
                                                return <Response 
                                                num={index} 
                                                response={res} 
                                                change={this.changeResponse} 
                                                />
                                            })}
                                            <div className='plus' onClick={this.addResponse}>
                                            +
                                            </div>
                                        </div>
                                    </div>
                                    <div id='patterns-box'>
                                        <h2>Patterns</h2>
                                        <div className='patterns'>
                                            {this.state.curQuestion.patterns.map((pat, index) => {
                                                return <Pattern 
                                                num={index} 
                                                pattern={pat} 
                                                change={this.changePattern} 
                                                />
                                            })}
                                            <div className='plus' onClick={this.addPattern}>
                                            +
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id='contacts-and-forms'>
                                    <div id='contacts-box'>
                                        <h2>Contacts</h2>
                                        <div className='contacts field-box'>
                                            <Select 
                                            className='contact field' 
                                            id='contact-1'
                                            options={this.makeOptions(this.state.contacts)}
                                            />
                                        </div>
                                    </div>
                                    <div id='documents-box'>
                                        <h2>Documents</h2>
                                        <div className='documents field-box'>
                                            <Select  
                                            className='document field' 
                                            id='document-1' 
                                            options={
                                                [{value:-1, label:'None'}]
                                            }
                                            />
                                        </div>
                                    </div>
                                    <div id='follow-up-box'>
                                        <h2>Follow Up Question</h2>
                                        <div className='follow-ups field-box'>
                                            <Select  
                                            className='follow-up field' 
                                            id='follow-up-1'
                                            value={ this.state.curQuestion['follow-up'] === undefined ? '' :
                                            this.state.curQuestion['follow-up'] === -1 ? { 
                                                value:-1, 
                                                label:'None'
                                            } : {
                                                value:this.state.curQuestion['follow-up'],
                                                label: this.state.questions.filter(
                                                    q=>q.id===this.state.curQuestion['follow-up'])[0].name
                                            }}

                                            options={this.makeOptions(
                                                this.state.questions.filter(
                                                    q=>q.id!==this.state.curQuestion.id))}
                                            onChange={this.handleSelectFollowUp}
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
        <div className='response'>
            <input 
            type='text' 
            className='response-text' 
            placeholder='New Response' 
            num={props.num} 
            value={props.response} 
            onChange={(event)=>props.change(event, props.num)}
            />
        </div>
    );
}

function Pattern(props) {
    return(
        <div className='pattern'>
            <input 
            type='text' 
            className='pattern-text' 
            placeholder='New Pattern' 
            num={props.num} 
            value={props.pattern} 
            onChange={(event)=>props.change(event, props.num)}
            />
        </div>
    );
}