import { cloneDeep, isEqual } from 'lodash';
import React from 'react';
import {confirmAlert} from 'react-confirm-alert';
import {defaultContact, getContacts, saveContact, deleteContact, removeFromQuestions} from './contacts';
import SelectionBox from '../SelectionBox';
import './contactsbox.css'


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

        this.state = {
            contacts: [],
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
                        <div id='new-item-selection'>
                            <p className='new-contact-text'>
                                Add New Contact
                            </p>
                            <div className='plus-select' onClick={(e)=>this.selectItem(e, defaultContact)}>
                                +
                            </div>
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
                                className='contact-title' 
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
                                className='contact-name' 
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
                                className='contact-email' 
                                id='contact-email' 
                                value={this.state.curContact.email} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let contact = this.state.curContact;
                                    contact.email = e.target.value;
                                    this.setState({curContact:contact});
                                 }}
                                 />
                            </div>
                            <div id='contact-buttons'>
                                <div id='contact-save'>
                                    <div 
                                        className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                        onClick={this.handleSave}
                                    >
                                        Save Changes
                                    </div>
                                    {this.state.savingContact ? 'Saving Contact, please wait' : ''}
                                </div>
                                <div id='contact-delete'>
                                    {this.state.curContact._id !== '' ? 
                                        <div id='contact-delete-button' className='button delete-button' onClick={this.handleDelete}>
                                            Delete Contact
                                        </div>:''
                                    }
                                    {this.state.deletingContact ? 'Deleting Contact, please wait' : ''}
                                </div>
                            </div>
                        </div>
                        <div id='contact-content'>

                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default ContactsBox;