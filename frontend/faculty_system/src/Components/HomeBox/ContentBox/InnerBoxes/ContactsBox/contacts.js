export const defaultContact = {
  _id:'',
  title:'',
  name:'',
  email:''
}


export function getContacts(callback) {
    let cfs = window.sessionStorage.getItem('contacts');
    if (cfs === null) {
      let options = {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
          },
  
      };
  
      fetch('http://127.0.0.1:5000/api/faculty/get_contacts', options)
        .then((res)=> {
            if (res.status === 401) {
              res.json().then((res)=> alert(res['message']));
              callback({});
            } else if (res.status === 200) {
              res.json().then((res)=> {
                window.sessionStorage.setItem('contacts', JSON.stringify(res['contacts']));
                callback(res['contacts']);
              });
            }
        })
        .catch((err) => {
          alert('Failed to retrieve entities.');
          console.log('error occurred', err);
          callback({});
        });
    } else {
      callback(JSON.parse(cfs));
    }
}

export function saveContact(callback) {
  callback({
    success:false,
    message:'Function not yet implemented.'
  });
}

export function deleteContact(callback) {
  callback({
    success:false,
    message:'Function not yet implemented.'
  });
}