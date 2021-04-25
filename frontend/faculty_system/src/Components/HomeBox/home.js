import {route, getToken} from '../../requestUtils'

export const sections = [
  'Questions',
  'Tags',
  'Users'
  // 'Contacts',
  // 'Documents',
  // 'Statistics'
]

export function retrain(callback) {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        }
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
      });
}

export function check_needs_training(callback) {
  let options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    }
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
    })
}

export function update_needs_training(value, callback) {
  let options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    },
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
    })
}

export function logOut() {
  window.sessionStorage.clear();
  window.location.href = '/';
}