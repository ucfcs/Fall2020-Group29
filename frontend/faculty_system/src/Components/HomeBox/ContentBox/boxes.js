import {QuestionsBox} from './InnerBoxes/QuestionsBox';
import {EntitiesBox} from './InnerBoxes/EntitiesBox';
import {ContactsBox} from './InnerBoxes/ContactsBox';


export function ContentBox(props) {
    return (
        <div id="content-box">
            {
                {
                    'navBox_Questions' : <QuestionsBox />,
                    'navBox_Entities' : <EntitiesBox />,
                    'navBox_Contacts' : <ContactsBox />
                }[props.selection]
            }
        </div>
    );
}
