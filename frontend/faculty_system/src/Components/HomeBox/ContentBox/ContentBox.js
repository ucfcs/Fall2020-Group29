import {QuestionsBox} from './InnerBoxes/QuestionsBox/QuestionsBox';
import {TagsBox} from './InnerBoxes/TagsBox/TagsBox';
import React from 'react';


export class ContentBox extends React.Component {
    constructor(props) {
        super(props);
        this.contentRef = React.createRef();

        this.hasChanges = this.hasChanges.bind(this);
    }
    
    hasChanges() {
        return this.contentRef.current.hasChanges();
    }

    saveCurrent(callback) {
        this.contentRef.current.saveCurrent(callback);
    }

    render() {
        return (
            <div id='content-box'>
                {
                    {
                        'navbox-questions' : <QuestionsBox ref={this.contentRef} updateTrain={this.props.updateTrain}/>,
                        'navbox-tags' : <TagsBox ref={this.contentRef} isAdmin={true}/>
                    }[this.props.selection]
                }
            </div>
        );
    }
}
