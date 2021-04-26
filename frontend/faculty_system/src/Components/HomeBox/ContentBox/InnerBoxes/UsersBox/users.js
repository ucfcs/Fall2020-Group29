import {route, headers} from '../../../../../requestUtils';


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
            headers: headers
        };

        fetch(route + 'get_users', options)
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
          }).catch((err)=> {
              alert('Could not retrieve users, ', err)
              callback([]);
          });
    } else {
        callback(JSON.parse(ufs));
    }
}

export function saveUser(user, callback) {
    let options = {
        method: user._id !== '' ? 'PUT' : 'POST',
        headers: headers,
        body: JSON.stringify({user:user})
    }
    let call = user._id !== '' ? 'update' : 'add';
    let succMessage = 'User successfully ' + (user._id !== '' ? 'updated' : 'added');

    fetch(route + call + '_user', options)
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
        }).catch((err)=> {
            callback({
                success:false,
                message: err
            });
        });
}

export function deleteUser(user, callback) {
    let options = {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({user:user})
    };

    fetch(route + 'delete_user', options)
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
        }).catch((err)=> {
            callback({
                success:false,
                message: err
            });
        });
}