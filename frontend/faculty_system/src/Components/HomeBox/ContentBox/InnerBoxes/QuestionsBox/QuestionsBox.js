import React from 'react';
import SelectionBox from '../SelectionBox';
import './questionsbox.css';
import {
    getQuestions, 
    saveQuestion, 
    defaultQuestion, 
    fieldsRequiringTraining, 
    makeContactOptions, 
    makeFollowUpOptions,
    saveQuestionAndTrain,
    deleteQuestion,
    deleteQuestionAndRetrain
} from './questions';
import {update_needs_training} from '../../../home';
import {getTags} from '../TagsBox/tags';
import {getContacts} from '../ContactsBox/contacts';
import Select from 'react-select';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {cloneDeep, isEqual} from 'lodash';


export class QuestionsBox extends React.Component {

    constructor(props) {
        super(props);
        
        this.saveCurrent = this.saveCurrent.bind(this);
        this.hasChanges = this.hasChanges.bind(this);
        this.hasTrainableChanges = this.hasTrainableChanges.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.changeResponse = this.changeResponse.bind(this);
        this.changePattern = this.changePattern.bind(this);
        this.addPattern = this.addPattern.bind(this);
        this.deletePattern = this.deletePattern.bind(this);
        this.handleSelectTag = this.handleSelectTag.bind(this);
        this.makeTagValue = this.makeTagValue.bind(this);
        this.handleSelectFollowUp = this.handleSelectFollowUp.bind(this);
        this.handleSelectContact = this.handleSelectContact.bind(this);
        this.populateFollowUpValue = this.populateFollowUpValue.bind(this);
        this.populateContactValue = this.populateContactValue.bind(this);
        this.hasValidTags = this.hasValidTags.bind(this);
        this.canSave = this.canSave.bind(this);
        this.saveAndTrain = this.saveAndTrain.bind(this);
        this.saveNoTrain = this.saveNoTrain.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.deleteAndTrain = this.deleteAndTrain.bind(this);
        this.deleteNoTrain = this.deleteNoTrain.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {
            search: '',
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

            contacts:[],

            savingQuestion: false,
            deletingQuestion:false
        };
    }

    /* 
    Function is used to acquire the questions and tags for the system on the first load of the session.
    
    */
    componentDidMount() {

        getQuestions((questions)=> {
            this.setState({
                questions:questions
            }, ()=>{
                this.filterSearch();
                let qFromStorage = window.sessionStorage.getItem('previous_question');
                if (qFromStorage != null){
                    this.setState({curQuestion:JSON.parse(qFromStorage)});
                }
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
    }

    saveCurrent(callback) {
        window.sessionStorage.setItem('previous_question', JSON.stringify(this.state.curQuestion));
        callback();
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
        if (this.state.curQuestion._id !== item._id || this.state.curQuestion._id === '') {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>this.setState({curQuestion: cloneDeep(item)}) 
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]
                    })
            } else {
                this.setState({curQuestion: cloneDeep(item)});
            }
        }
    }

    handleChangeSearch(event) {
        this.setState({search:event.target.value}, ()=>this.filterSearch())
    }

    filterSearch() {
        let questions = this.state.questions;
        let dis = questions.filter(q=> {
            let contained = q.name.toLowerCase().includes(this.state.search.toLowerCase()); 
            if (!contained) {
                if (q.response.toLowerCase().includes(this.state.search.toLowerCase())) {
                    contained = true;
                }
            }
            return contained; 
        });
        this.setState({displayedQuestions: dis.sort((a,b)=> {
            let s1 = `${a.tags.department} : ${a.tags.category} : ${a.tags.information}`;
            let s2 = `${b.tags.department} : ${b.tags.category} : ${b.tags.information}`;

            return s1 >= s2;
        })});
    }

    changeResponse(event) {
        event.preventDefault();
        let question = this.state.curQuestion;
        let response = question.responses;
        response= event.target.value;
        question.response = response;
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

    deletePattern(event, num) {
        event.preventDefault();
        let question = this.state.curQuestion;
        let patterns = question.patterns;
        patterns.splice(num, 1);
        question.patterns = patterns;
        this.setState({curQuestion: question});

    }

    handleSelectTag(e, tag) {
        let question = this.state.curQuestion;
        question.tags[tag] = e.label;
        this.setState({curQuestion:question});
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
            };
        }
    }

    handleSelectFollowUp(e) {
        let question = this.state.curQuestion;
        if (e.value === '' && question['follow-up'] !== undefined) {
            delete question['follow-up'];
        } else if (e.value !== '') {
            let followUp = this.state.questions.filter(
                val=>val._id===e.value)[0]
            question['follow-up'] = {_id: e.value, name:followUp.name};
        }
        this.setState({curQuestion:question});
    }

    handleSelectContact(e) {
        let question = this.state.curQuestion;
        let contacts = this.state.contacts;
        let contact = contacts.filter(con=>{
            return con._id === e.value;
        })[0];
        if (contact !== undefined) {
            question.contact = cloneDeep(contact);
            this.setState({curQuestion:question});
        } else if (question.contact !== undefined) {

            delete question.contact;
            this.setState({curQuestion:question});    
        }
    }

    populateFollowUpValue() {
        if (this.state.curQuestion['follow-up'] === undefined) {
            return '';
        }

        return {
            value:this.state.curQuestion['follow-up']._id,
            label: this.state.questions.filter(
                val=>val._id===this.state.curQuestion['follow-up']._id)[0].name
        };
                                             
    }

    populateContactValue() {
        if (this.state.curQuestion.contact === undefined) {
            return '';
        }

        let contact = this.state.contacts.filter(
            val=>val._id===this.state.curQuestion.contact._id)[0];

        return {
            value:this.state.curQuestion.contact._id,
            label: contact.title + ' - ' + contact.name
        };
                                              
    }

    hasValidTags() {
        let check = this.state.questions.filter(q=> {
          return isEqual(this.state.curQuestion.tags, q.tags);
        })[0];
      
        if (check === undefined) {
          return {
              valid:true,
              name:''
          };
        } else {
          return {
              valid: check._id === this.state.curQuestion._id,
              name: check.name
            };
        }
    }

    canSave() {
        return this.hasValidTags().valid && this.hasChanges()
    }

    saveAndTrain() {
        this.setState({savingQuestion:true}, ()=> {
            saveQuestionAndTrain(
                this.state.curQuestion, 
                this.props.updateTrain,
                update_needs_training,
                response=> {
                    this.setState({savingQuestion:false}, ()=> {
                        if (response.success) {
                            let questions = this.state.questions;
                            let question = questions.filter(q=>
                                q._id === this.state.curQuestion._id)[0];
                            if (question === undefined) {
                                questions.push(cloneDeep(response.question));
                                this.setState({curQuestion:cloneDeep(response.question)});
                            } else {
                                if (question.name !== response.question.name) {
                                    questions.forEach(q=>{
                                        if (q.followUp!== undefined && q.followUp._id === response.question._id) {
                                            q.followUp.name = response.question.name;
                                        }
                                    });
                                }
                                questions[questions.indexOf(question)] = cloneDeep(response.question);
                            }
                            this.setState({questions:questions}, ()=> {
                                this.filterSearch();
                                window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                alert(response.message);
                            });
                        } else {
                            console.error(response.message);
                            alert('Could not save question - \n' + response.message);
                        }
                    });
                }
            );
        });
    }

    saveNoTrain(needsTraining) {
        this.setState({savingQuestion:true}, ()=> {
            saveQuestion(
                this.state.curQuestion, 
                response=> {
                    this.setState({savingQuestion:false}, ()=> {
                        if (response.success) {
                            let questions = this.state.questions;
                            let question = questions.filter(q=>
                                q._id === this.state.curQuestion._id)[0];
                            if (question === undefined) {
                                questions.push(cloneDeep(response.question));
                                this.setState({curQuestion:cloneDeep(response.question)});
                            } else {
                                if (question.name !== response.question.name) {
                                    questions.forEach(q=>{
                                        if (q.followUp!== undefined && q.followUp._id === response.question._id) {
                                            q.followUp.name = response.question.name;
                                        }
                                    });
                                }
                                questions[questions.indexOf(question)] = cloneDeep(response.question);
                            }
                            this.setState({questions:questions, needsTraining:true}, ()=> {
                                this.filterSearch();
                                alert(response.message);
                                window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                if (needsTraining) {
                                    update_needs_training('Needs Training', (response)=> {
                                        if (response.success) {
                                            this.props.updateTrain('Needs Training');
                                        } else {
                                            alert(response.message);
                                        }
                                    });
                                }
                            });
                        } else {
                            console.error(response.message);
                            alert('Could not save question - \n' + response.message);
                        }
                    });
                }
            );
        });
    }

    handleSave(event) {
        event.preventDefault();
        if (this.canSave()) {
            if (this.hasTrainableChanges()) {
                confirmAlert({
                    title:'You\'ve made changes that require the system to be retrained.',
                    message: 'Would you like to save your changes and retrain now?',
                    buttons: [
                        {
                            label: 'Save and Retrain',
                            onClick: ()=> this.saveAndTrain()
                        },
                        {
                            label: 'Save and Don\'t Retrain',
                            onClick: ()=> this.saveNoTrain(true)
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
                            onClick: ()=> this.saveNoTrain(false)
                        },
                        {
                            label: 'Cancel',
                            onClick: ()=>{}
                        }
                    ]
                });
            }
        } 
    }

    deleteAndTrain() {
        this.setState({deletingQuestion:true},()=> {
            deleteQuestionAndRetrain(
                this.state.curQuestion,
                this.props.updateTrain,
                update_needs_training,
                (response)=> {
                    this.setState({deletingQuestion:false}, ()=> {
                        if (response.success) {
                            let questions = this.state.questions;
                            let remaining = questions.filter(q=> 
                                q._id !== this.state.curQuestion._id);

                            remaining.forEach(q=> {
                                if (q.followUp !== undefined && q.followUp._id === this.state.curQuestion._id) {
                                    delete q.followUp;
                                } 
                            });
                            this.setState({questions:remaining, curQuestion:cloneDeep(defaultQuestion)}, ()=> {
                                this.filterSearch();
                                window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                alert('Question succesfully deleted.');
                            });
                        } else {
                            console.error(response.message);
                            alert('Could not delete question -\n' + response.message);
                        }
                    });
                }
            );
        });
    }

    deleteNoTrain() {
        this.setState({deletingQuestion:true}, ()=> {
            deleteQuestion(
                this.state.curQuestion,
                (response)=> {
                    this.setState({deletingQuestion:false}, ()=> {
                        if (response.success) {
                            let questions = this.state.questions;
                            let remaining = questions.filter(q=> 
                                q._id !== this.state.curQuestion._id);

                            remaining.forEach(q=> {
                                if (q.followUp !== undefined && q.followUp._id === this.state.curQuestion._id) {
                                    delete q.followUp;
                                } 
                            });
                            this.setState({questions:remaining, curQuestion:cloneDeep(defaultQuestion)}, ()=> {
                                this.filterSearch();
                                window.sessionStorage.setItem("questions", JSON.stringify(this.state.questions));
                                alert('Question succesfully deleted.');
                            });
                        } else {
                            console.error(response.message);
                            this.props.updateTrain('Needs Training');
                            alert('Could not delete question -\n' + response.message);
                        }
                    });
                }
            );
        });
    }

    handleDelete(event) {
        event.preventDefault();
        confirmAlert({
            title: 'Are you sure you want to delete this question?',
            message: 'Question deletion will require the model to be retrained.',
            buttons: [
                {
                    label: 'Delete and Retrain',
                    onClick: this.deleteAndTrain
                },
                {
                    label: 'Delete and Don\'t Retrain',
                    onClick: this.deleteNoTrain
                },
                {
                    label: 'Cancel',
                    onClick: ()=> {}
                }
            ]
        });
    }
    
    render () {
        return (
            <>
                <div id='content-wrapper'>
                    <div id='question-selection'>
                        <div className='section-title'>
                            Questions
                        </div>
                        <div id='search-bar-wrapper'>
                            <input id='search-bar' type='text' placeholder='Search Questions' onChange={this.handleChangeSearch}/>
                        </div>
                        <div className='selection-wrapper'>
                            <SelectionBox 
                                name='questions' 
                                content={this.state.displayedQuestions} 
                                titles={this.state.displayedQuestions.map(q=> ({
                                    title:`${q.tags.department} : ${q.tags.category} : ${q.tags.information}`,
                                    name: q.name
                            
                                }))}
                                update={this.selectItem} 
                                curItem={this.state.curQuestion}
                            />
                            <div id='add-question-button' onClick={(e)=>this.selectItem(e, defaultQuestion)}>
                                +
                            </div>
                            
                        </div>   
                    </div>
                    <div id='question-content-body'>
                        <div id='question-selection-header'>
                            <div id='question-title'>
                                <label id='question-label' htmlFor='question-name'>
                                    Question Name
                                </label>
                                <input 
                                type='text' 
                                className='question-name' 
                                id='question-name' 
                                placeholder='Question Name'
                                value={this.state.curQuestion.name} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let question = this.state.curQuestion;
                                    question.name = e.target.value;
                                    this.setState({curQuestion:question});
                                 }}
                                 />
                            </div>
                            <div id='question-save'>
                                {this.canSave() === false && !this.state.savingQuestion ? '' : 
                                <div 
                                    className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                    onClick={this.handleSave}
                                    id='question-save-button'
                                >
                                    {this.state.savingQuestion ? 'Saving...' : 
                                    this.state.curQuestion._id === '' ? 'Save Question' : 'Save Changes'}
                                </div>
                                }    
                            </div>
                        </div>
                        <div id='question-content'>
                            <div id='entity-box'>
                                <label id='question-tags-label' htmlFor='entities'>
                                    Tags
                                </label>
                                <div className={this.hasValidTags().valid ? 'hide invalid-tags' : 'show invalid-tags'}>
                                    Question already exists with the given combination of tags:<br/> "{this.hasValidTags().name}"
                                </div>
                                <div id='entities'>
                                    <div className='entity-selection-box'>
                                        <label className='entity-label' htmlFor='intent-choice'>
                                            Intent
                                        </label>
                                        <Select 
                                        className={
                                            this.hasValidTags().valid ? 
                                                 'entity-select' : 'entity-select invalid-combo' 
                                        }
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
                                        className={
                                            this.hasValidTags().valid ? 
                                                 'entity-select' : 'entity-select invalid-combo' 
                                        }
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
                                        className={
                                            this.hasValidTags().valid ? 
                                                 'entity-select' : 'entity-select invalid-combo' 
                                        }
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
                                        className={
                                            this.hasValidTags().valid ? 
                                                 'entity-select' : 'entity-select invalid-combo' 
                                        }
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
                                        <label id='response-label' htmlFor='response'>
                                            Response
                                        </label>
                                        <textarea 
                                            id='response'
                                            placeholder='Response Text'
                                            value={this.state.curQuestion.response} 
                                            onChange={this.changeResponse} 
                                        />
                                    </div>
                                    <div id='patterns-box'>
                                        <div id='patterns-header'>
                                            <label id='patterns-label' htmlFor='patterns'>
                                                Patterns
                                            </label>
                                            <div className='plus' onClick={this.addPattern}>
                                                +
                                            </div>
                                        </div>
                                        <div className='patterns'>
                                            {this.state.curQuestion.patterns.map((pat, index) => {
                                                return (
                                                <Pattern 
                                                    num={index} 
                                                    pattern={pat} 
                                                    change={this.changePattern}
                                                    delete={this.deletePattern} 
                                                />)
                                            })}
                                            
                                        </div>
                                    </div>
                                    
                                </div>
                                <div id='contacts-and-forms'>
                                    <div id='question-follow-up-box'>
                                        <label id='follow-up-label' htmlFor='follow-up-field'>
                                            Follow Up Question
                                        </label>
                                        <div id='follow-up-field' className='follow-up field-box'>
                                            <Select  
                                            className='follow-up field' 
                                            id='follow-up'
                                            value={this.populateFollowUpValue()}
                                            options={makeFollowUpOptions(
                                                this.state.questions.filter(
                                                    q=>q._id!==this.state.curQuestion._id))}
                                            onChange={this.handleSelectFollowUp}
                                            />
                                        </div>
                                    </div>
                                    <div id='question-contacts-box'>
                                        <label id='question-contact-label' htmlFor='question-contact'>
                                            Contact
                                        </label>
                                        <div id='question-contact' className='contacts field-box'>
                                            <Select 
                                            className='contact field' 
                                            id='contact-1' 
                                            value={this.populateContactValue()}
                                            options={makeContactOptions(this.state.contacts)}
                                            onChange={this.handleSelectContact} 
                                            />
                                        </div>
                                    </div>
                                    <div id='question-delete'>
                                        {this.state.curQuestion._id !== '' ? 
                                            <div id='question-delete-button' className='button delete-button' onClick={this.handleDelete}>
                                                {this.state.deletingQuestion ? 'Deleting...' : 'Delete Question'}
                                            </div>
                                            :''
                                        }
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
            <div className='pattern-delete' onClick={(event)=>props.delete(event, props.num)}>
                X
            </div>
        </div>
    );
}   