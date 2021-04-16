
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
                    window.sessionStorage.setItem('users', JSON.stringify(users));
                    callback(users);
                });
              } else {
                  alert('Could not retrieve users.')
                  callback([]);
              }
          });
    } else {
        callback(JSON.parse(ufs));
    }
}

export function saveUser(user, callback) {
    let options = {
        method: user._id !== '' ? 'PUT' : 'POST',
        headers: {
            'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user:user})
    }
    let call = user._id !== '' ? 'update' : 'add';
    let succMessage = 'User successfully ' + (user._id !== '' ? 'updated' : 'added');

    fetch('http://127.0.0.1:5000/api/faculty/'+call+'_user', options)
        .then((res)=> {
            if (res.status === 401) {
                callback({
                    success:false,
                    message:'User not Authorized'
                });
            } else if (res.status === 200) {
                res.json().then((res)=> {
                    callback({
                        success:true,
                        user:res.user,
                        message: succMessage
                    })
                });
            } else {
                callback({
                    success:false,
                    message:'Failed to '+call+' user'
                });
            }
        })
}

export function deleteUser(user, callback) {
    let options = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + window.sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user:user})
    };

    fetch('http://127.0.0.1:5000/api/faculty/delete_user', options)
        .then((res)=> {
            if (res.status === 401) {
                callback({
                    success:false,
                    message:'User not Authorized'
                });
            } else if (res.status === 200) {
                res.json().then((res)=> {
                    callback({
                        success: true,
                        message: res.message
                    })
                });
            } else {
                callback({
                    success: false,
                    message: 'Unable to delete user.'
                })
            }
        })
}