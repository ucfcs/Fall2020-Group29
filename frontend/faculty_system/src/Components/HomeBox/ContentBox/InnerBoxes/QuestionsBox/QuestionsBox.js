import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import {getQuestions, saveQuestion, defaultQuestion, fieldsRequiringTraining} from './questions';
import {getTags} from '../TagsBox/tags';
import {getContacts} from '../ContactsBox/contacts';
import {getDocuments} from '../DocumentsBox/documents';
import Select from 'react-select';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {cloneDeep, isEqual} from 'lodash';

export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.hasChanges = this.hasChanges.bind(this);
        this.hasTrainableChanges = this.hasTrainableChanges.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.changeResponse = this.changeResponse.bind(this);
        this.deleteResponse = this.deleteResponse.bind(this);
        this.addResponse = this.addResponse.bind(this);
        this.changePattern = this.changePattern.bind(this);
        this.addPattern = this.addPattern.bind(this);
        this.handleSelectTag = this.handleSelectTag.bind(this);
        this.makeTagValue = this.makeTagValue.bind(this);
        this.handleSelectDropdown = this.handleSelectDropdown.bind(this);
        this.makeDropdownValue = this.makeDropdownValue.bind(this);
        this.makeOptions = this.makeOptions.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.state = {
            hasChanges:false,
            questions:[],
            displayedQuestions:[],
            curQuestion: cloneDeep(defaultQuestion),
            tags:{
                'intent': [],
                'category': [],
                'department': [],
                'information': []

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
            this.setState({
                questions:questions,
                displayedQuestions:questions
            });
        });

        getTags((tags)=> {
            this.setState({tags:tags}, ()=> {
                this.setState({
                    intentList: this.state.tags.intent.map(int => ({
                         'value':int._id,
                         'label':int.name
                    })),
                    departmentList: this.state.tags.department.map(dept => ({
                         'value':dept._id,
                         'label':dept.name
                    })),
                    categoryList: this.state.tags.category.map(cat => ({
                         'value':cat._id,
                         'label':cat.name
                    })),
                    infoList: this.state.tags.information.map(info => ({
                         'value':info._id,
                         'label':info.name
                    }))
                });
            });
        });

        getContacts((contacts)=> {
            this.setState({contacts:contacts});
        });

        getDocuments((documents)=> {
            this.setState({documents:documents});
        });
    }

    hasChanges() {
        if (this.state.curQuestion._id === '') {
            return !isEqual(defaultQuestion, this.state.curQuestion);
        } else {
            let question = this.state.questions.filter(q=>
                q._id === this.state.curQuestion._id)[0];
            return !isEqual(question, this.state.curQuestion);
        }
    }

    hasTrainableChanges() {
        
        if (this.state.curQuestion._id === '') {
        /*
            If the question is a new one, it has to be changed regardless. 
            If it has changes, they're trainable ones.
        */
            return this.hasChanges();
        } else {
            let trainableChanges = false;
            let question = this.state.questions.filter(q=>
                q._id === this.state.curQuestion._id)[0];
            fieldsRequiringTraining.forEach(field=> {
                if (!isEqual(question[field], this.state.curQuestion[field])) {
                    trainableChanges = true;
                }
            });
            return trainableChanges;
        }
        
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.curQuestion._id !== item._id) {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>this.setState({curQuestion: cloneDeep(item), hasChanges:false}) 
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]
                    })
            } else {
                this.setState({curQuestion: cloneDeep(item), hasChanges:false});
            }
        }
    }

    filterSearch(event) {
        let questions = this.state.questions;
        let dis = questions.filter(q=> {
            let contained = q.name.toLowerCase().includes(event.target.value.toLowerCase())
            if (!contained) {
                q.responses.forEach(r=> {
                    if (r.toLowerCase().includes(event.target.value.toLowerCase())) {
                        contained = true;
                        return contained;
                    }
                })
            }
            return contained; 
        });
        this.setState({displayedQuestions: dis});
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
        question.tags[tag] = e.label;
        this.setState({curQuestion:question, hasChanges:true});
    }

    makeTagValue(key) {
        if (this.state.curQuestion.tags[key] === '') {
            return '';
        } else {
            return {
                value:(()=> {
                    let tag = this.state.tags[key].filter(t=>
                    t.name === this.state.curQuestion.tags[key])[0]
                    return tag === undefined ? '':tag._id
                })(),
                label:this.state.curQuestion.tags[key]
            }
        }
    }

    handleSelectDropdown(e, key) {
        let question = this.state.curQuestion;
        question[key] = e.value;
        this.setState({curQuestion:question});
    }

    makeDropdownValue(skey, qkey) {
        if (this.state.curQuestion[qkey] === undefined) {
            return ''
        } else if (this.state.curQuestion[qkey] === '0') {
            return {
                value:'0', 
                label:'None'
            }

        } else {
            return {
                value:this.state.curQuestion[qkey],
                label: this.state[skey].filter(
                    val=>val._id===this.state.curQuestion[qkey])[0].name
            }
        }                                      
    }

    makeOptions(values) {
        let options = values.map(val=> ({
            value:val._id,
            label:val.name   
        }));
        options.unshift({value:'0',label:'None'});
        return options
    }

    handleSave(event) {
        event.preventDefault();
        if (this.hasChanges()) {
            if (this.hasTrainableChanges()) {
                confirmAlert({
                    title:'You\'ve made changes which require the system to be retrained.',
                    message: 'Would you like to save your changes and retrain now?',
                    buttons: [
                        {
                            label: 'Save and Retrain',
                            onClick: ()=> saveQuestion(this.state.curQuestion, response=> {
                                if (response.success) {
                                    let questions = this.state.questions;
                                    let question = questions.filter(q=>
                                        q._id === this.state.curQuestion._id)[0];
                                    if (question === undefined) {
                                        questions.push(cloneDeep(response.question));
                                        this.setState({curQuestion:cloneDeep(response.question)});
                                    } else {
                                        questions[questions.indexOf(question)] = cloneDeep(response.question);
                                    }
                                    this.setState({questions:questions}, ()=> {
                                        window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                        alert(response.message);
                                    });
                                } else {
                                    console.error(response.message);
                                    alert('Could not save question - \n' + response.message);
                                }
                            })
                        },
                        {
                            label: 'Save and Don\'t Retrain',
                            onClick: ()=>saveQuestion(this.state.curQuestion, response=> {
                                if (response.success) {
                                    let questions = this.state.questions;
                                    let question = questions.filter(q=>
                                        q._id === this.state.curQuestion._id)[0];
                                    if (question === undefined) {
                                        questions.push(cloneDeep(response.question));
                                        this.setState({curQuestion:cloneDeep(response.question)});
                                    } else {
                                        questions[questions.indexOf(question)] = cloneDeep(response.question);
                                    }
                                    this.setState({questions:questions}, ()=> {
                                        window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                        alert(response.message + '\n Please Remember to retrain the system before you log out.');
                                    });
                                } else {
                                    console.error(response.message);
                                    alert('Could not save question - \n' + response.message);
                                }
                            })
                        },
                        {
                            label: 'Cancel',
                            onClick: ()=>{}
                        }
                    ]
                }); 
            } else {
                confirmAlert({
                    title:'Are you sure you want to save these changes?',
                    message: '',
                    buttons: [
                        {
                            label: 'Yes, please save',
                            onClick: ()=>saveQuestion(this.state.curQuestion, response=> {
                                if (response.success) {
                                    let questions = this.state.questions;
                                    let question = questions.filter(q=>
                                        q._id === this.state.curQuestion._id)[0];
                                    if (question === undefined) {
                                        questions.push(cloneDeep(response.question));
                                        this.setState({curQuestion:cloneDeep(response.question)});
                                    } else {
                                        questions[questions.indexOf(question)] = cloneDeep(response.question);
                                    }
                                    this.setState({questions:questions}, ()=> {
                                        window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                        alert(response.message);
                                    });
                                } else {
                                    console.error(response.message);
                                    alert('Could not save question - \n' + response.message);
                                }
                            })
                        },
                        {
                            label: 'No, continue working',
                            onClick: ()=>{}
                        }
                    ]
                });
            }
        }
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
                        curItem={this.state.curQuestion}
                        />
                        <div id='new-question-selection'>
                            <p className='new-question-text'>
                                Add New Question
                            </p>
                            <div className='plus-select' onClick={(e)=>this.selectItem(e, defaultQuestion)}>
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
                            <div 
                                className={'button save-button ' + (this.hasChanges() ? "selectable" : "non-selectable")}
                                onClick={this.handleSave}
                            >
                                 Save Changes
                            </div>
                            {/* <div className='button delete-button'>Delete Question</div> */}
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
                                        value={this.makeTagValue('intent')}
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
                                        value={this.makeTagValue('department')}
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
                                        value={this.makeTagValue('category')}
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
                                        value={this.makeTagValue('information')}
                                        options={this.state.infoList} 
                                        onChange={(e)=>this.handleSelectTag(e, 'information')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div id='entered-fields'>
                                <div id='patterns-and-responses'>
                                    <div id='response-box'>
                                        <h2>Response to Question</h2>
                                        <textarea 
                                            id='response'
                                            value={this.state.curQuestion.responses[0]} 
                                            onChange={(e)=> this.changeResponse(e, 0)} 
                                        />
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
                                            value={this.makeDropdownValue('contacts', 'contact')} 
                                            options={this.makeOptions(this.state.contacts)} 
                                            onChange={(e)=>this.handleSelectDropdown(e, 'contact')} 
                                            />
                                        </div>
                                    </div>
                                    <div id='documents-box'>
                                        <h2>Documents</h2>
                                        <div className='documents field-box'>
                                            <Select  
                                            className='document field' 
                                            id='document-1' 
                                            value={this.makeDropdownValue('documents', 'document')} 
                                            options={this.makeOptions(this.state.documents)} 
                                            onChange={(e)=>this.handleSelectDropdown(e, 'document')} 
                                            />
                                        </div>
                                    </div>
                                    <div id='follow-up-box'>
                                        <h2>Follow Up Question</h2>
                                        <div className='follow-ups field-box'>
                                            <Select  
                                            className='follow-up field' 
                                            id='follow-up-1'
                                            value={this.makeDropdownValue('questions', 'follow-up')} 
                                            options={this.makeOptions(
                                                this.state.questions.filter(
                                                    q=>q._id!==this.state.curQuestion._id))} 
                                            onChange={(e)=>this.handleSelectDropdown(e, 'follow-up')} 
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