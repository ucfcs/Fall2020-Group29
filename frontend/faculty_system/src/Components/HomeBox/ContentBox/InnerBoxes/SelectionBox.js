import React from 'react';


export function SelectionBox(props) {

    return (
        <div id='selection-box'>
            {props.content.map((item, index) => (
                <Selection 
                item={item} 
                selected={item._id === props.curItem._id} 
                title={props.titles[index]}
                update={props.update}
                />
            ))}
        </div>
    )
}

function Selection(props) {
    return (
        <div 
        className={'selection ' + (props.selected ? 'selected-option':'selection-option')}
        onClick={(e)=> props.update(e, props.item)} 
        >
            <div className='inner-selection'>
                <div className="selection-title-box">
                    <p className='selection-title'>{props.title.title}</p>
                    <p className='selection-name'>{props.title.name}</p>
                </div>
            </div>
        </div>
    )
}

export default SelectionBox;
