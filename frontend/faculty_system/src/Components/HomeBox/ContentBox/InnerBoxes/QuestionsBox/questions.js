
// export class Question {
//     constructor(id, name, patterns, entities, responses) {

//     }
// }

export const defaultQuestion = {
  '_id': '',
  'number':-1,
  'name': '',
  'responses': [''],
  'patterns': [],
  'tags': {
    'intent': '',
    'department': '',
    'category': '',
    'information': ''
  }
}


export function getQuestions(callback) {

  let qfs = window.sessionStorage.getItem('questions'); // qfs = Questions From Storage, used to grab the string before parsing to JSON
  if (qfs === null) {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('token')
        },
    };

    fetch('http://127.0.0.1:5000/api/faculty/get_questions', options)
      .then((res)=> {
          if (res.status === 401) {
            res.json().then((res)=> alert(res['message']));
            callback([]);
          } else if (res.status === 200) {
            res.json().then((res)=> {
                console.log(res);
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

  let options = {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': window.sessionStorage.getItem('token')
    },
    body: JSON.stringify({'question': question})
  };

  fetch('http://127.0.0.1:5000/api/faculty/update_question', options)
    .then((res)=> {
      if (res.status===200) {
        res.json().then((res)=> {
          let q = res['question'];
          formatQuestion(q);
          callback(
            {
              success:true,
              message:'Question updated',
              question: q
            });
        });
      } else {
        res.json().then((res)=> {
          callback(
            {
              success:false,
              message: res.message
            });
        });
      }
    })
  
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