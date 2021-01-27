import React, {useState} from 'react';
import SelectionBox from './SelectionBox';

export function ContactsBox() {

    const [selected, setSelected] = useState("");

    return (
        <>
            <div id="selection-wrapper">
                <SelectionBox name="Contacts" content={[{name:"Contact 1"}, {name:"Contact 2"}]} update={setSelected} />
            </div>
            <div id="content">
                
            </div>
        </>
    )
}