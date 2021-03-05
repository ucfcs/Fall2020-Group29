import React, {useState} from 'react';
import SelectionBox from '../SelectionBox';

export function ContactsBox() {

    const [selected, setSelected] = useState('');

    return (
        <>
            <div id='selection-wrapper'>
                <SelectionBox 
                name='contacts' 
                content={[{name:'Contact 1'}, {name:'Contact 2'}]} 
                titles={[{title:'Contact 1', name:''}, {title:'Contact 2', name:''}]}
                update={setSelected} />
            </div>
            <div id='content'>
                
            </div>
        </>
    )
}