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

    selectType(event, item) {
        event.preventDefault();
        if (this.state.curType !== item.name) {
            

            
                this.setState({curType:item.name}, ()=>{
                    let tags = this.concatTags();
                    let dis = tags.filter(t=>{
                        return this.state.curType === 'all' || t.type === this.state.curType;
                    });
                    this.setState({displayedTags:dis});
                });
            
        }
    }

    filterSearch(event) {
        event.preventDefault();
        let tags = this.concatTags();
        let dis = tags.filter(t=>{
            return t.name.toLowerCase().includes(event.target.value.toLowerCase());
        });
        this.setState({displayedTags:dis});
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
                        onClick: ()=>saveTag(this.state.curTag, response=> {
                            if (response.success) {
                                
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
                            <div id='search-bar'>
                                <input type='text' placeholder='Search' onChange={this.filterSearch}/>
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