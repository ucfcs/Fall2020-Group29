import React, {useState} from 'react';
import arrowB from './images/sidearrow_b.png';
import arrowG from './images/sidearrow_g.png';

export function SelectionBox(props) {

    const [list, setList] = useState(props.content.map(item => (
        <Selection name={item.name} selected={false} update={props.update}/>
    )));

    return (
        <>
            {list}
        </>
    )
}

function Selection(props) {
    return (
        <div className='selection-option'>
            {props.name}
            <div className='arrow'>
                <img src={props.selected ? arrowG : arrowB} alt='' style={{width:'16px', height:'16px'}} onClick={props.update} />
            </div>
        </div>
    )
}

export default SelectionBox;
