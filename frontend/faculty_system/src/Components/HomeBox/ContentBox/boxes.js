import {QuestionsBox} from './InnerBoxes/QuestionsBox';
import {EntitiesBox} from './InnerBoxes/EntitiesBox';
import {ContactsBox} from './InnerBoxes/ContactsBox';


export function ContentBox(props) {
    return (
        <div id="content-box">
            {
                {
                    'navbox-questions' : <QuestionsBox />,
                    'navbox-entities' : <EntitiesBox />,
                    'navbox-contacts' : <ContactsBox />
                }[props.selection]
            }
        </div>
    );
}
