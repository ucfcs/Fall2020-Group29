import {QuestionsBox} from './InnerBoxes/QuestionsBox/QuestionsBox';
import {TagsBox} from './InnerBoxes/TagsBox/TagsBox';
import {UsersBox} from './InnerBoxes/UsersBox/UsersBox';
import {StatsBox} from './InnerBoxes/StatsBox/StatsBox';
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
                        'navbox-questions' : <QuestionsBox ref={this.contentRef} updateTrain={this.props.updateTrain} />,
                        'navbox-tags' : <TagsBox ref={this.contentRef} isAdmin={true} />,
                        'navbox-users' : <UsersBox ref={this.contentRef} />,
                        'navbox-statistics': <StatsBox ref={this.contentRef} />
                    }[this.props.selection]
                }
            </div>
        );
    }
}
