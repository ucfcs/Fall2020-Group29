import {QuestionsBox} from './InnerBoxes/QuestionsBox/QuestionsBox';
import {EntitiesBox} from './InnerBoxes/EntitiesBox/EntitiesBox';
import {ContactsBox} from './InnerBoxes/ContactsBox/ContactsBox';


export function ContentBox(props) {
    return (
        <div id="content-box">
            {
                {
                    'navbox-questions' : <QuestionsBox/>,
                    'navbox-tags' : <EntitiesBox  isAdmin={true}/>,
                    'navbox-contacts' : <ContactsBox />
                }[props.selection]
            }
        </div>
    );
}
