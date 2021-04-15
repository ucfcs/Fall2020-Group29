
export const defaultUser = {
    _id:'',
    NID:'',
    name:'',
    email:'',
    IsAdmin:false
};

export function getUsers(callback) {
    let ufs = window.sessionStorage.getItem('users');
    if (ufs === null) {
        let options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        };

        fetch('http://127.0.0.1:5000/api/faculty/get_users', options)
          .then((res)=> {
            if (res.status === 401) {
                alert('User not Authorized');
                callback([]);
              } else if (res.status === 200) {
                res.json().then((res)=> {
                    let users = res['users'];
                    console.log(users);
                    window.sessionStorage.setItem('users', JSON.stringify(users));
                    callback(users);
                });
              }
          });
    } else {
        callback(JSON.parse(ufs));
    }
}