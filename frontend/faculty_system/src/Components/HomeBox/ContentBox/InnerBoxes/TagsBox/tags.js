
export const defaultTag = {
  _id:'',
  name:'',
  type: ''
}

export const tagTypes = ['intent', 'department', 'category', 'information']

export const tagFields = ['name', 'type']

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
        headers: {
            'Content-Type': 'application/json',
            'Authorization': window.sessionStorage.getItem('token')
        },

    };

    fetch('http://127.0.0.1:5000/api/faculty/get_tags', options)
      .then((res)=> {
          if (res.status === 401) {
            res.json().then((res)=> alert(res['message']));
            callback({});
          } else if (res.status === 200) {
            res.json().then((res)=> {
              window.sessionStorage.setItem('tags', JSON.stringify(res['tags']));
              callback(res['tags']);
            });
          }
      })
      .catch((err) => {
        alert('Failed to retrieve entities.');
        console.log('error occurred', err);
        callback({});
      });
  } else {
    callback(JSON.parse(tfs));
  }
}

export function saveTag(tag, callback) {
  let call = '';
  let method = '';
  let succMessage = '';

  if (tag._id === '') {
    call = 'add_tag';
    method = 'POST';
    succMessage = 'Tag successfully added.';
  } else {
    call = 'update_tag';
    method = 'PUT';
    succMessage = 'Tag successfully updated.';
  }

  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': window.sessionStorage.getItem('token')
    },
    body: JSON.stringify({'tag': tag})
  };

  fetch('http://127.0.0.1:5000/api/faculty/' + call, options)
    .then((res)=> {
      if (res.status === 200) {
        res.json.then((res)=> {
          callback({
            success: true,
            message: succMessage,
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
    });
}