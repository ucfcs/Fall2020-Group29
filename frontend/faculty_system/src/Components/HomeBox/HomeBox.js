import React, { useState } from 'react';
import { ContentBox } from './ContentBox/boxes';
import './homebox.css';

export function HomeBox () {

    const [selection, setSelection] = useState("navbox-questions");
    const [selectedNode, setSelectedNode] = useState("");

    function changeSelected(event) {

        event.preventDefault();
        console.log(selectedNode);
        

        let item = selectedNode;
        if (item === "") {
            item = document.getElementById('navbox-questions')
        }
        item.className = "navbox";
        item.selected = false;

        setSelection(event.target.id);
        setSelectedNode(event.target);
        event.target.className = "navbox selected";
        event.target.selected = true;
    }

    return (
        <div id="home-box">
            <div id="navbar">
                <div id="nav-header">
                    
                </div>
                <NavBox sectionName="Questions" selected={true}  clicked={changeSelected} />
                <NavBox sectionName="Tags" selected={false} clicked={changeSelected} />
                <NavBox sectionName="Contacts" selected={false} clicked={changeSelected} />
                <NavBox sectionName="Documents" selected={false} clicked={changeSelected} />
                <NavBox sectionName="Users" selected={false} clicked={changeSelected} />
                <NavBox sectionName="Statistics" selected={false} clicked={changeSelected} />
            </div>
            <ContentBox selection={selection} />
        </div>
    );
}

export default HomeBox;

function NavBox(props) {
    return (
        <div className={props.selected === true ? "navbox selected" : "navbox"}
         id={"navbox-"+props.sectionName.toLowerCase()} onClick={(event)=>props.clicked(event)}>
            {props.sectionName}
        </div>
    );
}