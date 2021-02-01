import React, {useState} from 'react';
import SelectionBox from './SelectionBox';

export function EntitiesBox() {

    const [selected, setSelected] = useState("");

    return (
        <>
            <div id="selection-wrapper">
                <SelectionBox name="entities" content={[{name:"Entity 1"}, {name:"Entity 2"}]} update={setSelected} />
            </div>
            <div id="content">
                
            </div>
        </>
    )
}