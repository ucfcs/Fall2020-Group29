import { cloneDeep, isEqual } from 'lodash';
import React from 'react';
import {confirmAlert} from 'react-confirm-alert';
import {defaultContact, getContacts, saveContact, deleteContact, removeFromQuestions, makeDepartmentOptions} from './contacts';
import SelectionBox from '../SelectionBox';
import './contactsbox.css'
import { getTags } from '../TagsBox/tags';
import Select from 'react-select';


export class ContactsBox extends React.Component {

    constructor(props) {
        super(props);

        this.hasChanges = this.hasChanges.bind(this);
        this.saveCurrent = this.saveCurrent.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.canSave = this.canSave.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleChangeDepartment = this.handleChangeDepartment.bind(this);
        this.handleDeleteDepartment = this.handleDeleteDepartment.bind(this);
        this.addDepartment = this.addDepartment.bind(this);

        this.state = {
            contacts: [],
            departments: [],
            displayedContacts: [],
            curContact: cloneDeep(defaultContact),
            search: '',

            savingContact:false,
            deletingContact:false
        }
    }

    componentDidMount() {
        getContacts((contacts)=> {
            this.setState({contacts:contacts}, ()=> {
                this.filterSearch();
                let ufs = window.sessionStorage.getItem('previous_contact');
                if (ufs !== null) {
                    this.setState({curContact:JSON.parse(ufs)});
                }
            });
        });

        getTags((tags)=> {
            this.setState({departments:tags.department});
        });
    }

    hasChanges() {
        if (this.state.curContact._id === '') {
            return !isEqual(this.state.curContact, defaultContact);
        } else {
            let contacts = this.state.contacts;
            let check = contacts.filter(contact=> {
                return contact._id === this.state.curContact._id;
            })[0];

            return !isEqual(this.state.curContact, check);
        }
    }

    saveCurrent(callback) {
        window.sessionStorage.setItem('previous_contact', JSON.stringify(this.state.curContact));
        callback();
    }

    selectItem(event, contact) {
        event.preventDefault();
        if (this.state.curContact._id !== contact._id || this.state.curContact._id === '') {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>this.setState({curContact: cloneDeep(contact)})
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]
                    })
            } else {
                this.setState({curContact: cloneDeep(contact)});
            }
        }
    }

    handleChangeSearch(event) {
        this.setState({search:event.target.value}, ()=>this.filterSearch());
    }

    filterSearch() {
        let contacts = this.state.contacts;
        let dis = contacts.filter(contact => {
            return contact.name.toLowerCase().includes(this.state.search.toLowerCase()) ||
            contact.title.toLowerCase().includes(this.state.search.toLowerCase());
        });
        this.setState({displayedContacts:dis.sort((a, b)=> a.name > b.name ? 1:-1)});
    }

    canSave() {
        return this.hasChanges();
    }

    handleSave(event) {
        event.preventDefault();
        confirmAlert({
            title: 'Are you sure you want to save these changes?',
            message:'',
            buttons: [
                {
                    label: 'Yes, please save',
                    onClick: ()=> {
                        this.setState({savingContact:true}, ()=> {
                            saveContact(this.state.curContact, (response)=> {
                                this.setState({savingContact:false}, ()=> {
                                    let contacts = this.state.contacts;
                                    if (response.success) {
                                        let check = contacts.filter(contact=>{
                                            return contact._id === response.contact._id
                                        })[0];
                                        if (check === undefined) {
                                            contacts.push(response.contact);
                                        } else {
                                            contacts[contacts.indexOf(check)] = cloneDeep(response.contact);
                                        }
                                        this.setState({contacts:contacts, curContact:cloneDeep(response.contact)}, ()=>{
                                            this.filterSearch();
                                            window.sessionStorage.setItem('contacts', JSON.stringify(this.state.contacts));
                                            alert(response.message);
                                        });
                                    } else {
                                        alert(response.message);
                                    }
                                });
                            });
                        });
                    }
                },
                {
                    label: 'Cancel',
                    onClick: ()=> {}
                }
            ]
        });
    }

    handleDelete(event) {
        confirmAlert({
            title:'Are you sure you want to delete this contact?',
            message:'',
            buttons:[
                {
                    label: 'Yes, delete contact',
                    onClick: ()=> {
                        this.setState({deletingContact:true}, ()=> {
                            deleteContact(this.state.curContact, (response)=> {
                                this.setState({deletingContact:false}, ()=> {
                                    if (response.success) {
                                        let contacts = this.state.contacts;
                                        contacts = contacts.filter(contact=> {
                                            return contact._id !== this.state.curContact._id;
                                        });
                                        removeFromQuestions(this.state.curContact, ()=> {
                                            this.setState({contacts:contacts, curContact:cloneDeep(defaultContact)}, ()=> {
                                                this.filterSearch();
                                                window.sessionStorage.setItem('contacts', JSON.stringify(this.state.contacts));
            
                                                alert(response.message);
                                            });
                                        });
                                    } else {
                                        alert(response.message);
                                    }
                                });
                            });
                        });
                    }
                },
                {
                    label: 'Cancel',
                    onClick: ()=>{}
                }
            ]
        })
    }

    handleChangeDepartment(event, num) {
        let contact = this.state.curContact;
        let departments = contact.departments;
        if (departments !== undefined) {
            let new_dept = this.state.departments.filter(d=> {
                return d._id === event.value;
            })[0];
            if (new_dept !== undefined) {
                departments[num] = {
                    _id:new_dept._id,
                    name:new_dept.name
                }
                contact.departments = departments;
                this.setState({curContact:contact}, ()=> console.log(this.state.curContact));
            }
        }
    }

    handleDeleteDepartment(event, num) {
        event.preventDefault();
        let contact = this.state.curContact;
        let departments = contact.departments;
        if (departments !== undefined) {
            departments.splice(num, 1);
            if (departments.length === 0) {
                delete contact.departments;
            }
        }
        this.setState({curContact:contact});
    }

    addDepartment(event) {
        event.preventDefault();
        let contact = this.state.curContact;
        let departments = contact.departments;
        if (departments === undefined) {
            departments = [];
        }
        departments.push('');
        contact.departments = departments;
        this.setState({curContact:contact});
    }

    render() {
        return (
            <>
                <div id='content-wrapper'>
                    <div id='contact-selection'>
                        <div className='section-title'>
                            Contacts
                        </div>
                        <div id='search-bar-wrapper'>
                            <input id='search-bar' type='text' placeholder='Search' onChange={this.handleChangeSearch}/>
                        </div>
                        <div className='selection-wrapper'>
                            <SelectionBox 
                                name='contacts' 
                                content={this.state.displayedContacts} 
                                titles={this.state.displayedContacts.map(contact=> ({
                                    title: contact.title,
                                    name: contact.name
                                }))}
                                update={this.selectItem}
                                curItem={this.state.curContact}
                            />
                            <div id='add-contact-button' onClick={(e)=>this.selectItem(e, defaultContact)}>
                                +
                            </div>
                        </div>
                    </div>
                    <div id='contact-content-body'>
                        <div id='contact-selection-header'>
                            <div id='contact-title-header'>
                                <label id='contact-title-label' htmlFor='contact-title'>
                                    Contact Title
                                </label>
                                <input 
                                type='text' 
                                className='contact-title text-box' 
                                id='contact-title' 
                                value={this.state.curContact.title} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let contact = this.state.curContact;
                                    contact.title = e.target.value;
                                    this.setState({curContact:contact});
                                 }}
                                 />
                                <label id='contact-label' htmlFor='contact-name'>
                                    Contact Name
                                </label>
                                <input 
                                type='text' 
                                className='contact-name text-box' 
                                id='contact-name' 
                                value={this.state.curContact.name} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let contact = this.state.curContact;
                                    contact.name = e.target.value;
                                    this.setState({curContact:contact});
                                 }}
                                 />
                                <label id='contact-email-label' htmlFor='contact-email'>
                                    Contact Email
                                </label>
                                <input 
                                type='text' 
                                className='contact-email text-box' 
                                id='contact-email' 
                                value={this.state.curContact.email} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let contact = this.state.curContact;
                                    contact.email = e.target.value;
                                    this.setState({curContact:contact});
                                 }}
                                 />
                                <div id='contact-departments-header'>
                                    <label id='contact-departments-label' htmlFor='contact-departments-box'>
                                        Departments Associated with Contact
                                    </label>
                                    <div id='contact-add-department' className='plus' onClick={this.addDepartment}>
                                        +
                                    </div>
                                </div>
                                <div id='contact-departments-wrapper'>
                                    <div id='contact-departments-box'>
                                        {this.state.curContact.departments === undefined ? '' :
                                            this.state.curContact.departments.map((dept, index)=> {
                                                return <Department 
                                                value={dept === '' ? '' : {
                                                    value:dept._id,
                                                    label:dept.name
                                                }}
                                                num={index}
                                                options={makeDepartmentOptions(this.state.departments)}
                                                change={this.handleChangeDepartment}
                                                delete={this.handleDeleteDepartment}
                                                />
                                            })
                                        }
                                    
                                    </div>
                                    
                                </div>
                            </div>
                            <div id='contact-buttons'>
                                <div id='contact-save'>
                                    {this.canSave() || this.state.savingContact ? <div 
                                    id='contact-save-button'
                                    className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                    onClick={this.handleSave}
                                    >
                                        {this.state.savingContact ? 'Saving...' : 
                                        this.state.curContact._id === '' ? 'Save Contact' : 'Save Changes'}
                                    </div> : ''
                                    }
                                </div>
                                <div id='contact-delete'>
                                    {this.state.curContact._id !== '' ? 
                                        <div id='contact-delete-button' className='button delete-button' onClick={this.handleDelete}>
                                            {this.state.deletingContact ? 'Deleting...' : 'Delete Contact'}
                                        </div> : ''
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default ContactsBox;

function Department(props) {
    return (
        <div className='contact-department'>
            <Select
            className='contact-department-select'
            classNamePrefix='contact-department-selection'
            value={props.value}
            options={props.options}
            onChange={(event)=>props.change(event, props.num)} 
            />
            <div className='contact-department-delete' onClick={(event)=>props.delete(event, props.num)}>
                X
            </div>
        </div>
    )
}