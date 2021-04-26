import {getQuestions} from '../QuestionsBox/questions';
import {route, headers} from '../../../../../requestUtils';

export const defaultTag = {
  _id:'',
  name:'',
  type: ''
}

export const tagTypes = ['intent', 'department', 'category', 'information'];

export const tagFields = ['name', 'type'];

export function hasAllFields(tag) {
  let hasFields = true;
  let missingFields = [];
  tagFields.forEach(field=> {
    if (tag[field] === '') {
      hasFields = false;
      missingFields.push(field);
    }
  });

  return {
    hasFields: hasFields,
    missingFields: missingFields
  };
}


export function getTags(callback) {
  let tfs = window.sessionStorage.getItem('tags');
  if (tfs === null) {
    let options = {
        method: 'GET',
        headers: headers

    };

    fetch(route + 'get_tags', options)
      .then((res)=> {
          if (res.status === 401) {
            alert('User not authorized');
            callback({});
          } else if (res.status === 200) {
            res.json().then((res)=> {
              window.sessionStorage.setItem('tags', JSON.stringify(res['tags']));
              callback(res['tags']);
            });
          }
      }).catch((err) => {
        alert('Failed to retrieve entities.');
        console.log('error occurred', err);
        callback({});
      });
  } else {
    callback(JSON.parse(tfs));
  }
}

export function checkTypeDependents(tags, callback) {
  getQuestions((questions)=>{
    let hasDependents = false;
    let dependentQuestions = []
    if (tags.oldTag.type !== tags.newTag.type) {
      questions.forEach(q=> {
        if (q.tags[tags.oldTag.type] === tags.oldTag.name) {
          hasDependents = true;
          dependentQuestions.push(q.name);
        }
      });
    }
    callback({
      hasDependents:hasDependents,
      dependentQuestions:dependentQuestions
    });
  });
}

export function checkDependents(tag, callback) {
  getQuestions((questions)=>{
    let hasDependents = false;
    let dependentQuestions = []
    questions.forEach(q=> {
      if (q.tags[tag.type] === tag.name) {
        hasDependents = true;
        dependentQuestions.push(q.name);
      }
    });
    callback({
      hasDependents:hasDependents,
      dependentQuestions:dependentQuestions
    });
  });
}

export function updateTag(tags, callback) {

  let options = {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({'new_tag': tags.newTag, 'old_tag': tags.oldTag})
  };
  fetch(route + 'update_tag', options)
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
            message: 'Tag successfully updated.',
            tag: res.tag
          });
        });
      } else {
        res.json().then((res)=> {
          callback({
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

export function addTag(tag, callback) {
  let options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({'tag': tag})
  };

  fetch(route + 'add_tag', options)
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
            message: 'Tag successfully added.',
            tag: res.tag
          });
        });
      } else {
        res.json().then((res)=> {
          callback({
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

export function deleteTag(tag, callback) {
  let options = {
    method: 'DELETE',
    headers: headers,
    body: JSON.stringify({'tag': tag})
  };

  fetch(route + 'delete_tag', options)
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
            message: 'Tag successfully deleted.'
          });
        });
      } else {
        res.json().then((res)=> {
          callback({
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