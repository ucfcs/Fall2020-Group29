import { cloneDeep } from 'lodash';
import React from 'react';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';
import SelectionBox from '../SelectionBox';
import { getTags } from './tags';

export class TagsBox extends React.Component {

    constructor(props) {
        super(props);

        this.selectItem = this.selectItem.bind(this);
        this.concatTags = this.concatTags.bind(this);

        this.state = {
            selected:null,
            tags:{
                'intent': [],
                'category': [],
                'department': [],
                'information': []

            },
            curTag: {
                _id:'',
                name:'',
                type: ''
            }
        }
    }

    componentDidMount() {
        getTags((tags)=> {
            this.setState({tags:tags});
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
            this.setState({curTag:cloneDeep(item)})
        }
    }

    render() {
        return (
            <>
                <div id='selection-wrapper'>
                    <SelectionBox 
                    name='tags' 
                    content={this.concatTags()}
                    titles={this.concatTags().map(tag=>({
                        title:tag.name,
                        name:tag.type
                    }))}
                    update={this.selectItem} 
                    curItem={this.state.curTag}
                    />
                </div>
                <div id='content'>
                
                </div>
            </>
        )
    }
}