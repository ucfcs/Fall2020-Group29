import React, { useState } from 'react';
import { ContentBox } from './ContentBox/boxes';
import './homebox.css';

export function HomeBox () {

    const [selection, setSelection] = useState("navBox_Questions");
    const [selectedNode, setSelectedNode] = useState("");

    function changeSelected(event) {

        event.preventDefault();
        console.log(selectedNode);
        

        let item = selectedNode;
        if (item === "") {
            item = document.getElementById('navBox_Questions')
        }
        item.className = "navBox";
        item.selected = false;

        setSelection(event.target.id);
        setSelectedNode(event.target);
        event.target.className = "navBox Selected";
        event.target.selected = true;
    }

    return (
        <div>
            <div id="navBar">
                Nav Bar
                <NavBox sectionName="Questions" selected={true}  clicked={changeSelected} />
                <NavBox sectionName="Entities" selected={false} clicked={changeSelected} />
                <NavBox sectionName="Contacts" selected={false} clicked={changeSelected} />
            </div>
            <ContentBox selection={selection} />
        </div>
    );
}

export default HomeBox;

function NavBox(props) {
    return (
        <div className={props.selected === true ? "navBox Selected" : "navBox"}
         id={"navBox_"+props.sectionName} onClick={(event)=>props.clicked(event)}>
            {props.sectionName}
        </div>
    );
}