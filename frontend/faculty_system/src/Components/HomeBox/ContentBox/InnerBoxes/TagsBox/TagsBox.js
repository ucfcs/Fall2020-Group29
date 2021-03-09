import React from 'react';
import arrowB from '../images/sidearrow_b.png';
import arrowG from '../images/sidearrow_g.png';
import SelectionBox from '../SelectionBox';

export class TagsBox extends React.Component {

    constructor(props) {
        super(props);

        this.selectItem = this.selectItem.bind(this);

        this.state = {
            selected:null
        }
    }

    selectItem(event, item) {
        event.preventDefault();
        if (this.state.selected !== event.target) {
            if (this.state.selected !== null) {
                this.state.selected.setAttribute('src', arrowB);
                let selectedParent = this.state.selected.parentNode;
                selectedParent.parentNode.className = 'selection-option';
            }

            this.setState({selected: event.target}, ()=> {
                let parent = event.target.parentNode;
                event.target.setAttribute('src', arrowG);
                parent.parentNode.className = 'selected-option';
            });
        }
    }

    render() {
        return (
            <>
                <div id='selection-wrapper'>
                    <SelectionBox 
                    name='tags' 
                    content={[{name:'Tag 1'}, {name:'Tag 2'}]} 
                    titles={[{title:'Tag 1', name:''}, {title:'Tag 2', name:''}]}
                    update={this.selectItem} />
                </div>
                <div id='content'>
                
                </div>
            </>
        )
    }
}