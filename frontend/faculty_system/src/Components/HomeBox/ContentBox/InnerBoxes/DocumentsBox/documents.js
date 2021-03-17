export function getDocuments(callback) {
    let dfs = window.sessionStorage.getItem('documents');
    if (dfs === null) {
      let options = {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': window.sessionStorage.getItem('token')
          },
  
      };
  
      fetch('http://127.0.0.1:5000/api/faculty/get_documents', options)
        .then((res)=> {
            if (res.status === 401) {
              res.json().then((res)=> alert(res['message']));
              callback({});
            } else if (res.status === 200) {
              res.json().then((res)=> {
                window.sessionStorage.setItem('documents', JSON.stringify(res['documents']));
                callback(res['documents']);
              });
            }
        })
        .catch((err) => {
          alert('Failed to retrieve entities.');
          console.log('error occurred', err);
          callback({});
        });
    } else {
      callback(JSON.parse(dfs));
    }
  }