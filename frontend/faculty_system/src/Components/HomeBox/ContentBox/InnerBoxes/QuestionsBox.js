import React, {useState} from 'react';
import SelectionBox from './SelectionBox';
import './questionsbox.css';
import arrowB from './images/sidearrow_b.png';
import arrowG from './images/sidearrow_g.png';

export function QuestionsBox() {

    let selected = null;

    function selectItem(event) {
        event.preventDefault();
        console.log(selected);
        if (selected !== null) {
            selected.setAttribute('src', arrowB);
            let selectedParent = selected.parentNode;
            selectedParent.parentNode.className = "selection-option";
        }

        selected = event.target;
        let parent = event.target.parentNode;
        console.log(parent.parentNode);
        event.target.setAttribute('src', arrowG);
        parent.parentNode.className = "selected-option";
    }

    return (
        <>
            <div id="search-bar">
                <div className="section-title">
                    Questions
                </div>
            </div>
            <div id="selection-wrapper">
                <SelectionBox name="questions" content={[{name:"Question 1"}, {name:"Question 2"}]} update={selectItem} />
                <div id="new-question-selection">
                    Add New Question 
                    <div className="plus">
                        +
                    </div>
                </div>
            </div>
            <div id="content">
                <div id="entity-dropdowns">
                    <select name="category" id="category-dropdown">

                    </select>
                    <select name="action" id="action-dropdown">
                        
                    </select>
                    <select name="information" id="information-dropdown">

                    </select>
                </div>
            </div>
        </>
    )
}