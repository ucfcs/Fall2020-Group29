export const sections = [
  'Questions',
  'Tags'
  // 'Contacts',
  // 'Documents',
  // 'Users',
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

export function logOut() {
  window.sessionStorage.clear();
  window.location.href = '/';
}