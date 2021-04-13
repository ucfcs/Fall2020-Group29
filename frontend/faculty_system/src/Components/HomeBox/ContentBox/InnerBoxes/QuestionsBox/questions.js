// export class Question {
//     constructor(id, name, patterns, entities, responses) {

//     }
// }

export const defaultQuestion = {
  '_id': '',
  'name': '',
  'response': '',
  'patterns': [],
  'tags': {
    'intent': '',
    'department': '',
    'category': '',
    'information': ''
  }
};

const requiredFields = [
  'name',
  'response', 
  'patterns', 
  'tags'
];

const tagTypes = [
  'intent',
  'department',
  'category',
  'information'
];

export const fieldsRequiringTraining = [
  'patterns',
  'tags'
];

export function makeOptions(values) {
  let options = values.map(val=> ({
      value:val._id,
      label:val.name   
  }));
  options.unshift({value:'0',label:'None'});
  return options
}

export function getQuestions(callback) {

  let qfs = window.sessionStorage.getItem('questions'); // qfs = Questions From Storage, used to grab the string before parsing to JSON
  if (qfs === null) {
    let options = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
    };
    fetch('http://127.0.0.1:5000/api/faculty/get_questions', options)
      .then((res)=> {
          if (res.status === 401) {
            res.json().then((res)=> alert(res['message']));
            callback([]);
          } else if (res.status === 200) {
            res.json().then((res)=> {
                let questions = res['questions'];
                questions.forEach(q => formatQuestion(q));
                window.sessionStorage.setItem('questions', JSON.stringify(questions));
                callback(questions);
            });
          }
      })
      .catch((err) => {
        alert('Failed to retrieve questions.');
        console.log('error occurred', err);
        callback([]);
      });
  } else {
    callback(JSON.parse(qfs));
  }
}

export function saveQuestion(question, callback) {
  let call = '';
  let method = '';
  let succMessage = '';
  let hasFields = hasAllFields(question);
    
  if (!hasFields.hasFields) {
    callback(
      {
        success: false,
        message: 'Question missing required fields:\n' + hasFields.missingFields.join(', ')
      }
    )
    return;

  } else if (question._id === '') {
    call = 'add_question';
    method = 'POST';
    succMessage = 'Question Successfully Added to System.';
  } else {
    call = 'update_question';
    method = 'PUT';
    succMessage = 'Question Successfully Updated.'
  }

  let options = {
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + window.sessionStorage.getItem('token'),
    },
    body: JSON.stringify({'question': question, 'retrain': false})
  };

  fetch('http://127.0.0.1:5000/api/faculty/' + call, options)
    .then((res)=> {
      if (res.status===200) {
        res.json().then((res)=> {
          let q = res['question'];
          formatQuestion(q);
          callback(
            {
              success: true,
              message: succMessage,
              question: q
            });
        });
      } else {
        res.json().then((res)=> {
          callback(
            {
              success: false,
              message: res.message
            });
        });
      }
    })
  
}

export function saveQuestionAndTrain(question, update, callback) {
  let call = '';
  let method = '';
  let succMessage = '';
  let hasFields = hasAllFields(question);
  let saved = false;
  if (!hasFields.hasFields) {
    callback(
      {
        success: false,
        message: 'Question missing required fields:\n' + hasFields.missingFields.join(', ')
      }
    )
    return;

  } else if (question._id === '') {
    call = 'add_question';
    method = 'POST';
    succMessage = 'Question Successfully Added to System.\n Now starting training.';
  } else {
    method = 'PUT';
    call = 'update_question';
    succMessage = 'Question Successfully Updated.\n Now starting training.'
  }

  let options = {
    method: method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
    },
    body: JSON.stringify({'question': question})
  };

  fetch('http://127.0.0.1:5000/api/faculty/' + call, options)
    .then((res)=> {
      if (res.status===200) {
        res.json().then((res)=> {
          let q = res['question'];
          formatQuestion(q);
          saved = true;
          callback(
            {
              success: true,
              message: succMessage,
              question: q
            });

            if (saved===true) {
              update('Training Now');
              options = {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': window.sessionStorage.getItem('token')
                }
              };
        
              fetch('http://127.0.0.1:5000/api/faculty/retrain_model', options)
              .then((res)=> {
                if (res.status===200) {
                  res.json().then((res)=> {
                    update('Fully Trained');
                    alert(res['message']);
                  });
                } else {
                  update('Needs Training');
                  alert('Error: System could not be retrained.');
                }
              });
          }
        });
      } else {
        res.json().then((res)=> {
          callback(
            {
              success: false,
              message: res.message
            });
        });
      }
    });  
}


function formatQuestion(question) {
  let tags = question.tags;
  question.tags = {
    'intent': tags[0],
    'department': tags[1],
    'category': tags[2],
    'information': tags[3]
  }
}

function hasField(question, field) {
  return question[field].length !== 0;
}

function hasAllFields(question) {
  let hasAllFields = true;
  let missingFields = [];
  requiredFields.forEach(field => {
    if (field === 'tags') {
      tagTypes.forEach(tag => {
        if (!hasField(question.tags, tag)) {
          hasAllFields = false;
          missingFields.push(tag);
        }
      });
    } else {
      if (!hasField(question, field)) {
        hasAllFields = false;
        missingFields.push(field);
      }
    }
  });
    
    return {
      hasFields: hasAllFields,
      missingFields: missingFields
    }
}