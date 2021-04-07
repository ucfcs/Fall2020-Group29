import {QuestionsBox} from './InnerBoxes/QuestionsBox/QuestionsBox';
import {TagsBox} from './InnerBoxes/TagsBox/TagsBox';
import {ContactsBox} from './InnerBoxes/ContactsBox/ContactsBox';


export function ContentBox(props) {
    return (
        <div id='content-box'>
            {
                {
                    'navbox-questions' : <QuestionsBox updateTrain={props.updateTrain}/>,
                    'navbox-tags' : <TagsBox  isAdmin={true}/>,
                    'navbox-contacts' : <ContactsBox />
                }[props.selection]
            }
        </div>
    );
}
