export const defaultLink = {
  _id:'',
  name:'',
  url:''
}

export function getLinks(callback) {
    let lfs = window.sessionStorage.getItem('links');
    if (lfs === null) {
      let options = {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
          },
  
      };
  
      fetch('http://127.0.0.1:5000/api/faculty/get_dummy_links', options)
        .then((res)=> {
            if (res.status === 401) {
              res.json().then((res)=> alert(res['message']));
              callback({});
            } else if (res.status === 200) {
              res.json().then((res)=> {
                window.sessionStorage.setItem('links', JSON.stringify(res['links']));
                callback(res['links']);
              });
            }
        })
        .catch((err) => {
          alert('Failed to retrieve entities.');
          console.log('error occurred', err);
          callback({});
        });
    } else {
      callback(JSON.parse(lfs));
    }
}

export function deleteLink(link, callback) {
  callback({
    success:false,
    message:'Function not yet implemented'
  })
}

export function saveLink(link, callback) {

  let call = link._id === '' ? 'add' : 'update'
  let method = link._id === '' ? 'POST' : 'PUT'
  let succMessage = link._id === '' ? 'added.' : 'updated.'

  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
    },
    body: JSON.stringify(link)
  };

  fetch('/api/faculty/' + call + '_link', options)
    .then((res)=> {
      if (res.status === 401) {
        alert('User not Authorized.');
        callback({});
      } else if (res.status === 200) {
        res.json().then((res)=> {
          callback({
            success:true,
            message:'Link successfully ' + succMessage,
            link: res.link
          });
        });
      } else {
        callback({
          success:false,
          message: 'Failed to ' + call + ' link'
        });
      }
    });
}