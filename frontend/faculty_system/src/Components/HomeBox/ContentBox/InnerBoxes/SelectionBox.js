import React, {useState} from 'react';
import arrowB from './images/sidearrow_b.png';
import arrowG from './images/sidearrow_g.png';

export function SelectionBox(props) {

    return (
        <>
            {props.content.map(item => (
                <Selection item={item} selected={false} update={props.update}/>
            ))}
        </>
    )
}

function Selection(props) {
    return (
        <div className='selection-option'>
            <p className='selection-name'>{props.item.name}</p>
            <div className='arrow'>
                <img src={props.selected ? arrowG : arrowB} alt='' style={{width:'16px', height:'16px'}} onClick={(e)=> props.update(e, props.item)} />
            </div>
        </div>
    )
}

export default SelectionBox;
