import {route, headers} from '../../../../../requestUtils';

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

export function makeContactOptions(values) {
  let options = values.map(val=> ({
      value:val._id,
      label:val.title + ' - ' + val.name   
  }));
  options.unshift({value:'',label:'None'});

  return options
}

export function makeFollowUpOptions(values) {
  let options = values.map(val=> ({
      value:val._id,
      label:val.name   
  }));
  options.unshift({value:'',label:'None'});

  return options
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


export function getQuestions(callback) {

  let qfs = window.sessionStorage.getItem('questions'); // qfs = Questions From Storage, used to grab the string before parsing to JSON
  if (qfs === null) {
    let options = {
        method: 'GET',
        headers: headers
    };
    fetch(route + 'get_questions', options)
      .then((res)=> {
          if (res.status === 401) {
            alert('User not Authorized');
            callback([]);
          } else if (res.status === 200) {
            res.json().then((res)=> {
                let questions = res['questions'];
                questions.forEach(q => formatQuestion(q));
                window.sessionStorage.setItem('questions', JSON.stringify(questions));
                callback(questions);
            });
          }
      }).catch((err) => {
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
    headers: headers,
    body: JSON.stringify({'question': question, 'retrain': false})
  };

  fetch(route + call, options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status===200) {
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
    }).catch((err)=> {
      callback({
        success:false,
        message: err
      });
    });
}

export function saveQuestionAndTrain(question, updateText, updateSetting,  callback) {
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
    headers: headers,
    body: JSON.stringify({'question': question})
  };

  fetch(route + call, options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status===200) {
        res.json().then((res)=> {
          let q = res['question'];
          formatQuestion(q);
          callback(
            {
              success: true,
              message: succMessage,
              question: q
            });
            saved = true;
          if (saved===true) {
            console.log(updateSetting);
            updateSetting('Training Now', (response)=> {
              if (response.success) {
                updateText('Training Now');
                options = {
                  method: 'GET',
                  headers: headers
                };
        
                fetch(route + 'retrain_model', options)
                  .then((res)=> {
                    if (res.status === 401) {
                      callback({
                        success: false,
                        message: 'User not Authorized'
                      });
                    } else if (res.status===200) {
                      res.json().then((res)=> {
                        updateSetting('Fully Trained', (finResponse)=> {
                          updateText('Fully Trained');
                          alert(res['message']);
                        });
                      });
                    } else {
                      updateSetting('Needs Training', (finResponse)=> {
                        updateText('Needs Training');
                        alert('Error: System could not be retrained.');
                      });
                    }
                  }).catch((err)=> {
                    callback({
                      success:false,
                      message: err
                    });
                  });
                } else {
                  alert(response.message);
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
    }).catch((err)=> {
      callback({
        success:false,
        message: err
      });
    });
}

export function deleteQuestion(question, callback) {
  if (question._id === '') {
    callback({
      success: false,
      message: 'Cannot delete a question not in the database.'
    });
    return;
  }

  let options = {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify({'question': question})
  }

  fetch(route + 'delete_question', options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status === 200) {
        res.json().then((res)=> {
          callback({
            success: true,
            message: res.message
          })
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
    }).catch((err)=> {
      callback({
        success:false,
        message: err
      });
    });
}

export function deleteQuestionAndRetrain(question, updateText, updateSetting, callback) {
  if (question._id === '') {
    callback({
      success: false,
      message: 'Cannot delete a question not in the database.'
    });
    return;
  }

  let options = {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify({'question': question})
  }

  fetch(route + 'delete_question', options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status === 200) {
        res.json().then((res)=> {
          callback({
            success: true,
            message: res.message
          });

          updateSetting('Training Now', (response)=> {
            if (response.success) {
              updateText('Training Now');
              options = {
                method: 'GET',
                headers: headers
              };
      
              fetch(route + 'retrain_model', options)
                .then((res)=> {
                  if (res.status === 401) {
                    updateSetting('Needs Training', (finResponse)=> {
                      updateText('Needs Training');
                      alert('Error: User not Authorized');
                    });
                  } else if (res.status===200) {
                    res.json().then((res)=> {
                      updateSetting('Fully Trained', (finResponse)=> {
                        updateText('Fully Trained');
                        alert(res['message']);
                      });
                    });
                  } else {
                    updateSetting('Needs Training', (finResponse)=> {
                      updateText('Needs Training');
                      alert('Error: System could not be retrained.');
                    });
                  }
                }).catch((err)=> {
                  updateSetting('Needs Training', (finResponse)=> {
                    updateText('Needs Training');
                    alert(err);
                  });
                });
              } else {
                alert(response.message);
              }
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
    }).catch((err)=> {
      callback({
        success:false,
        message: err
      });
    });
}