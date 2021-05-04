import {route} from '../../requestUtils';

export function login(nID, pass, callback) {

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: nID,
            password: pass,
        })
    };
    fetch(route + 'login', options)
      .then((res) => {
        if (res.status === 200) {
          res.json().then((res)=> {
            callback({
              success:true,
              token:res['token'],
              isAdmin:res['isAdmin']
            });
          });
        } else {
          res.json().then((res)=> {
            callback({
              success:false,
              message:res.message,
              error:res.message
            });
          });
        }
      }).catch((err) => {
        callback({
          success:false,
          message:'Login Failed',
          error:'error occurred'+ err
        });
      });
}  
