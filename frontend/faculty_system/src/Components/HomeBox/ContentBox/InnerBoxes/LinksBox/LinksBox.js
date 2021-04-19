import { cloneDeep, isEqual } from 'lodash';
import React from 'react';
import {confirmAlert} from 'react-confirm-alert';
import {defaultLink, getLinks, saveLink, deleteLink} from './links';
import SelectionBox from '../SelectionBox';
import './linksbox.css'


export class LinksBox extends React.Component {

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
            links: [],
            displayedLinks: [],
            curLink: cloneDeep(defaultLink),
            search: ''
        }
    }

    componentDidMount() {
        getLinks((links)=> {
            this.setState({links:links}, ()=> {
                this.filterSearch();
                let lfs = window.sessionStorage.getItem('previous_link');
                if (lfs !== null) {
                    this.setState({curLink:JSON.parse(lfs)});
                }
            });
        });
    }

    hasChanges() {
        if (this.state.curLink._id === '') {
            return !isEqual(this.state.curLink, defaultLink);
        } else {
            let links = this.state.links;
            let check = links.filter(link=> {
                return link._id === this.state.curLink._id;
            })[0];

            return !isEqual(this.state.curLink, check);
        }
    }

    saveCurrent(callback) {
        window.sessionStorage.setItem('previous_link', JSON.stringify(this.state.curLink));
        callback();
    }

    selectItem(event, link) {
        event.preventDefault();
        if (this.state.curLink._id !== link._id || this.state.curLink._id === '') {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>this.setState({curLink: cloneDeep(link)})
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]
                    })
            } else {
                this.setState({curLink: cloneDeep(link)});
            }
        }
    }

    handleChangeSearch(event) {
        this.setState({search:event.target.value}, ()=>this.filterSearch());
    }

    filterSearch() {
        let links = this.state.links;
        let dis = links.filter(link => {
            return link.name.toLowerCase().includes(this.state.search.toLowerCase());
        });
        this.setState({displayedLinks:dis.sort((a, b)=> a.name > b.name ? 1:-1)});
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
                        saveLink(this.state.curLink, (response)=> {
                            let links = this.state.links;
                            if (response.success) {
                                let check = links.filter(link=>{
                                    return link._id === response.link._id
                                })[0];
                                if (check === undefined) {
                                    links.push(response.user);
                                } else {
                                    links[links.indexOf(check)] = cloneDeep(response.link);
                                }
                                this.setState({links:links, curUser:cloneDeep(response.link)}, ()=>{
                                    this.filterSearch();
                                    window.sessionStorage.setItem('links', JSON.stringify(this.state.links));
                                    alert(response.message);
                                });
                            } else {
                                alert(response.message);
                            }
                        })
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
            title:'Are you sure you want to delete this user?',
            message:'',
            buttons:[
                {
                    label: 'Yes, delete user',
                    onClick: ()=> {
                        deleteLink(this.state.curLink, (response)=> {
                            if (response.success) {
                                let links = this.state.links;
                                links = links.filter(link=> {
                                    return link._id !== this.state.curLink._id;
                                });
                                this.setState({links:links, curLink:cloneDeep(defaultLink)}, ()=> {
                                    this.filterSearch();
                                    window.sessionStorage.setItem('links', JSON.stringify(this.state.links));
                                    alert(response.message);
                                })
                            } else {
                                alert(response.message);
                            }
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
                    <div id='link-selection'>
                        <div className='section-title'>
                            Links
                        </div>
                        <div id='search-bar-wrapper'>
                            <input id='search-bar' type='text' placeholder='Search' onChange={this.handleChangeSearch}/>
                        </div>
                        <div id='new-item-selection'>
                            <p className='new-link-text'>
                                Add New Link
                            </p>
                            <div className='plus-select' onClick={(e)=>this.selectItem(e, defaultLink)}>
                                +
                            </div>
                        </div>
                        <div className='selection-wrapper'>
                            <SelectionBox 
                                name='links' 
                                content={this.state.displayedLinks} 
                                titles={this.state.displayedLinks.map(link=> ({
                                    title: link.name,
                                    name: link['url']
                                }))}
                                update={this.selectItem}
                                curItem={this.state.curLink}
                            />
                        </div>
                    </div>
                    <div id='link-content-body'>
                        <div id='link-selection-header'>
                            <div id='link-title'>
                                <label id='link-label' htmlFor='link-name'>
                                    Link Name
                                </label>
                                <input 
                                type='text' 
                                className='link-name' 
                                id='link-name' 
                                value={this.state.curLink.name}
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let link = this.state.curLink;
                                    link.name = e.target.value;
                                    this.setState({curLink:link});
                                 }}
                                 />
                                 <label id='link-url-label' htmlFor='link-url'>
                                    Url
                                </label>
                                <input 
                                type='text' 
                                className='link-url' 
                                id='link-url' 
                                value={this.state.curLink.url} 
                                onChange={(e)=>{
                                    e.preventDefault();
                                    let link = this.state.curLink;
                                    link.url = e.target.value;
                                    this.setState({curLink:link});
                                 }}
                                 />
                            </div>
                            <div id='link-buttons'>
                                <div id='link-save'>
                                    <div 
                                        className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                        onClick={this.handleSave}
                                    >
                                        Save Changes
                                    </div>
                                </div>
                                <div id='link-delete'>
                                    {this.state.curLink._id !== '' ? 
                                        <div id='link-delete-button' className='button delete-button' onClick={this.handleDelete}>
                                            Delete Link
                                        </div>:''
                                    }
                                </div>
                            </div>
                        </div>
                        <div id='link-content'>

                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default LinksBox;