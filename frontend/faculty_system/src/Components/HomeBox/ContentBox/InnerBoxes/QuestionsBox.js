import React, {useState} from 'react';
import SelectionBox from './SelectionBox';

export function QuestionsBox() {

    const [selected, setSelected] = useState("");

    return (
        <>
            <div id="selection-wrapper">
                <SelectionBox name="Questions" content={[{name:"Question 1"}, {name:"Question 2"}]} update={setSelected} />
            </div>
            <div id="content">
                <div id="entity_dropdowns">
                    <select name="category" id="category_dropdown">

                    </select>
                    <select name="action" id="action_dropdown">
                        
                    </select>
                    <select name="information" id="information_dropdown">

                    </select>
                </div>
            </div>
        </>
    )
}