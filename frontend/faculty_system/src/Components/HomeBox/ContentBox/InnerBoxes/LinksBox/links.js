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
  callback({
    success:false,
    message:'Function not yet implemented'
  })
}