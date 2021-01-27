import React, {useState} from 'react';

export function SelectionBox(props) {

    const [list, setList] = useState(props.content.map(item => (
        <Selection name={item.name} update={props.update}/>
    )));

    return (
        <div>
            {list}
        </div>
    )
}

function Selection(props) {
    return (
        <div className="selectionOption" onClick={props.update(props.name)}>
            {props.name}
        </div>
    )
}

export default SelectionBox;
