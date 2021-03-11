import React, {useState} from 'react';
import arrowB from './images/sidearrow_b.png';
import arrowG from './images/sidearrow_g.png';

export function SelectionBox(props) {

    return (
        <>
            {props.content.map((item, index) => (
                <Selection 
                item={item} 
                selected={item._id === props.curItem._id} 
                title={props.titles[index]}
                update={props.update}
                />
            ))}
        </>
    )
}

function Selection(props) {
    return (
        <div className={props.selected ? 'selected-option':'selection-option'}>
            <div className="selection-title-box">
                <p className='selection-title'>{props.title.title}</p>
                <p className='selection-name'>{props.title.name}</p>
            </div>
            <div className='arrow'>
                <img 
                src={props.selected ? arrowG : arrowB} 
                alt='' 
                style={{width:'16px', height:'16px'}} 
                onClick={(e)=> props.update(e, props.item)} 
                />
            </div>
        </div>
    )
}

export default SelectionBox;
