export const sections = [
  'Questions',
  'Tags',
  'Contacts',
  'Attached-Links',
  'Users' 
  // 'Statistics'
]

export function retrain(callback) {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
        }
      };
  
      fetch('http://127.0.0.1:5000/api/faculty/retrain_model', options)
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
        'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
    }
  };
  fetch('http://127.0.0.1:5000/api/faculty/check_needs_training', options)
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
      'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
    },
    body: JSON.stringify({'value': value})
  };
  fetch('http://127.0.0.1:5000/api/faculty/update_needs_training', options)
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