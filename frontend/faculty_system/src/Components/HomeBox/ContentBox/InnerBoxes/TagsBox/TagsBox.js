import { cloneDeep, isEqual } from 'lodash';
import React from 'react';
import Select from 'react-select';
import {confirmAlert} from 'react-confirm-alert';
import SelectionBox from '../SelectionBox';
import { defaultTag, getTags, tagTypes, hasAllFields, saveTag } from './tags';
import './tagsbox.css';

export class TagsBox extends React.Component {

    constructor(props) {
        super(props);

        this.concatTags = this.concatTags.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.updateDisplayedTags = this.updateDisplayedTags.bind(this);
        this.selectType = this.selectType.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.handleSelectType = this.handleSelectType.bind(this);
        this.hasValidChanges = this.hasValidChanges.bind(this);
        this.hasChanges = this.hasChanges.bind(this);
        this.canSave = this.canSave.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.state = {
            selected:null,
            tags:{
                'intent': [],
                'category': [],
                'department': [],
                'information': []

            },
            displayedTags:[],
            curTag: defaultTag,
            curType: 'all'
        }
    }

    componentDidMount() {
        getTags((tags)=> {
            this.setState({tags:tags}, ()=>{
                this.setState({displayedTags:this.concatTags()});
            });
        });
    }

    concatTags() {
        let tagList = [];
        for (const [key, value] of Object.entries(this.state.tags)) {
            tagList = tagList.concat(value.map(tag=>{
                return {
                    _id:tag._id,
                    name:tag.name,
                    type:key
                };
            }));
        }
        console.log(tagList);
        return tagList;
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.curTag._id !== item._id) {
            if (this.hasChanges()) {
                confirmAlert({
                    title:"You have unsaved changes",
                    message: "Do you want to leave without saving your changes?",
                    buttons: [
                        {
                            label: "Yes",
                            onClick: ()=>{
                                let tag = cloneDeep(item);
                                if (isEqual(tag, defaultTag)) {
                                    tag.type = this.state.curType === 'all' ? '' : this.state.curType;
                                }
                                this.setState({curTag:tag});
                            }
                        },
                        {
                            label: "No",
                            onClick: ()=>{}
                        }
                    ]});
            } else {
                let tag = cloneDeep(item);
                if (isEqual(tag, defaultTag)) {
                    tag.type = this.state.curType === 'all' ? '' : this.state.curType;
                }
                this.setState({curTag:tag});
            }
        }
    }

    updateDisplayedTags() {
        let tags = this.concatTags();
        let searchVal = '';
        let search = document.getElementById('search-bar');
        if (search !== undefined) {
            searchVal = search.value;
        }

        let dis = tags.filter(t=>{
            return (this.state.curType === 'all' || t.type === this.state.curType) && 
            t.name.toLowerCase().includes(searchVal.toLowerCase());
        });
        this.setState({displayedTags:dis});
        

    }

    selectType(event, item) {
        event.preventDefault();
        if (this.state.curType !== item.name) {
                this.setState({curType:item.name}, ()=>{
                    this.updateDisplayedTags();
                });
            
        }
    }

    filterSearch(event) {
        event.preventDefault();
        this.updateDisplayedTags();
    }

    handleSelectType(event) {
        let tag = this.state.curTag;
        tag.type = event.value;
        this.setState({curTag:cloneDeep(tag)});
    }

    hasValidChanges() {
        let tags = this.state.tags[this.state.curTag.type];
        if (tags === undefined) {
            return true;
        } else {
            let check = tags.filter(t=>{
                return t.name === this.state.curTag.name;
            })[0]
            if (check !== undefined) {
                return check._id === this.state.curTag._id;
            } else {
                return true;
            }
        }
    }

    hasChanges() {
        if (this.state.curTag._id === '') {
            return !isEqual(this.state.curTag, defaultTag);
        } else {
            let tags = this.concatTags();
            let cur = tags.filter(t=>{
                return t._id === this.state.curTag._id;
            })[0];
            return !isEqual(this.state.curTag, cur);
        }
    }

    canSave() {
        return this.hasChanges() && this.hasValidChanges() && hasAllFields(this.state.curTag).hasFields;
    }

    handleSave(event) {
        event.preventDefault();
        if (this.canSave()) {
            confirmAlert({
                title:'Are you sure you want to save these changes?',
                message: '',
                buttons: [
                    {
                        label: 'Yes, please save',
                        onClick: ()=> saveTag(this.state.curTag._id === '' ? {
                            newTag:this.state.curTag
                        } : {newTag:this.state.curTag, oldTag:this.concatTags().filter(tag=> {
                            return tag._id === this.state.curTag._id;
                        })[0]
                        }, response=> {
                            if (response.success) {
                                let newTag = response.tag;
                                let tags = this.state.tags;
                                let tagTypeList = tags[newTag.type];
                                let check = tagTypeList.filter(tag=> {
                                    return tag._id === newTag._id;
                                })[0];
                                if (check === undefined) {
                                    tagTypeList.push(cloneDeep(newTag));
                                    this.setState({curTag:cloneDeep(newTag)})
                                } else {
                                    /* 
                                    When updating a tag name, go through the questions stored in local storage and 
                                    change any instance of the old tag name to the new tag name for the corresponding
                                    type.
                                    */
                                    let qfs = window.sessionStorage.getItem('questions');
                                    if (qfs !== null) {
                                        let questions = JSON.parse(qfs);
                                        questions.forEach(question => {
                                            if (question.tags[newTag.type] === check.name) {
                                                question.tags[newTag.type] = newTag.name;
                                            }
                                        });
                                        window.sessionStorage.setItem('questions', questions);
                                    }
                                }
                                tags[newTag.type] = tagTypeList;
                                this.setState({tags:tags}, ()=> {
                                    window.sessionStorage.setItem('tags', JSON.stringify(this.state.tags));
                                    this.updateDisplayedTags();
                                    alert(response.message);
                                })

                            } else {
                                console.error(response.message);
                                alert('Could not save tag - \n' + response.message);
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

    render() {
        return (
            <>
                <div id="content-wrapper">
                    <div id='tag-selection-wrapper'>
                        <div id='type-selection'>
                            <div className='section-title'>
                                Tag Type
                            </div>
                            <SelectionBox 
                            name='tag-types' 
                            content={['all'].concat(tagTypes).map((tag, index)=>({
                                _id:index,
                                name:tag
                            }))}
                            titles={['all'].concat(tagTypes).map(tag=>({
                                title:tag,
                                name:''
                            }))}
                            update={this.selectType}
                            curItem={{
                                _id:this.state.curType === 'all' ? 0 : (tagTypes.indexOf(this.state.curType) + 1),
                                name:this.state.curType
                            }}
                            />
                        </div>
                        <div id='tag-selection'>
                            <div className='section-title'>
                                Tags
                            </div>
                            <div id='search-bar-wrapper'>
                                <input id='search-bar' type='text' placeholder='Search' onChange={this.filterSearch}/>
                            </div>
                            <div id='tag-select-wrapper'>
                                <SelectionBox 
                                name='tags' 
                                content={this.state.displayedTags}
                                titles={this.state.displayedTags.map(tag=>({
                                    title:tag.name,
                                    name:tag.type
                                }))}
                                update={this.selectItem} 
                                curItem={this.state.curTag}
                                />
                                <div id='new-tag-selection'>
                                    <p className='new-tag-text'>
                                        Add New Tag
                                    </p>
                                    <div className='plus-select' onClick={(e)=>this.selectItem(e, defaultTag)}>
                                        +
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id='content'>
                        <div id='selection-header'>
                            <label id='tag-label' htmlFor='tag-name'>
                                Tag Name
                            </label>
                            <input 
                            type='text' 
                            className={'tag-name' + (this.hasValidChanges() ? '' : ' invalid')} 
                            id='tag-name' 
                            value={this.state.curTag.name} 
                            onChange={(e)=>{
                                e.preventDefault();
                                let tag = this.state.curTag;
                                tag.name = e.target.value;
                                this.setState({curTag:tag});
                             }}
                             />
                            <div 
                                className={'button save-button ' + (this.canSave() ? "selectable" : "non-selectable")}
                                onClick={this.handleSave}
                            >
                                 Save Changes
                            </div>
                        </div>
                        <div id='tag-content'>
                             <Select 
                                id='tag-type'
                                value={
                                    this.state.curTag.type === '' ? '' :
                                    {value:this.state.curTag.type, label:this.state.curTag.type}
                                }
                                options={tagTypes.map(t=>({
                                    value:t,
                                    label:t
                                }))}
                                onChange={this.handleSelectType}
                             />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}