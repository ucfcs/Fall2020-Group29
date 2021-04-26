import {route, headers} from '../../requestUtils'

export const sections = [
  'Questions',
  'Tags',
  'Contacts',
  // 'Attached-Links',
  'Users' 
  // 'Statistics'
]

export function retrain(callback) {
    let options = {
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
              callback({
                  message: res['message'],
                  trained: true
                });
          });
        } else {
          callback({
              message: 'Error: System could not be retrained.',
              trained: false
            });
        }
      }).catch((err)=> {
        callback({
          success:false,
          message: err
        });
      });
}

export function check_needs_training(callback) {
  let options = {
    method: 'GET',
    headers: headers
  };
  fetch(route + 'check_needs_training', options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status === 200) {
        res.json().then((res)=> {
          callback({
            success:true,
            trained: res.trained
          });
        });
      } else {
        res.json().then((res)=> {
          callback({
            success:false,
            message:res.message
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

export function update_needs_training(value, callback) {
  let options = {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({'value': value})
  };
  fetch(route + 'update_needs_training', options)
    .then((res)=> {
      if (res.status === 401) {
        callback({
          success: false,
          message: 'User not Authorized'
        });
      } else if (res.status === 200) {
        callback({
          success:true
        });
      } else {
        res.json().then((res)=> {
          callback({
            success:false,
            message:res.message
          })
        })
      } 
    }).catch((err)=> {
      callback({
        success:false,
        message: err
      });
    });
}

export function logOut() {
  window.sessionStorage.clear();
  window.location.href = '/';
}