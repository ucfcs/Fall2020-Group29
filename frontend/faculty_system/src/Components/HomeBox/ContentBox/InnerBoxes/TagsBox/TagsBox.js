import { cloneDeep } from 'lodash';
import React from 'react';
import SelectionBox from '../SelectionBox';
import { defaultTag, getTags } from './tags';

export class TagsBox extends React.Component {

    constructor(props) {
        super(props);

        this.selectItem = this.selectItem.bind(this);
        this.concatTags = this.concatTags.bind(this);
        this.filterSearch = this.filterSearch.bind(this);

        this.state = {
            selected:null,
            tags:{
                'intent': [],
                'category': [],
                'department': [],
                'information': []

            },
            displayedTags:[],
            curTag: defaultTag
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
        if (this.state.curTag._id !==item._id) {
            this.setState({curTag:cloneDeep(item)}, ()=>console.log(this.state.curTag));
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

    render() {
        return (
            <>
                <div id='selection-wrapper'>
                    <div className='section-title'>
                        Tags
                    </div>
                    <div id='search-bar'>
                        <input type='text' placeholder='Search' onChange={this.filterSearch}/>
                    </div>
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
                <div id='content'>
                
                </div>
            </>
        )
    }
}