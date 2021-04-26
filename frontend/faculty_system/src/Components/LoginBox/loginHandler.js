import {route} from '../../requestUtils';

export function login(nID, pass) {
	console.log(nID);
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
        if (res.status === 401) {
          res.json().then((res)=> alert(res['message']));
        } else if (res.status === 200) {
          res.json().then((res)=> {
			window.sessionStorage.setItem('token', JSON.stringify(res['token'])); 
			window.location.href = ('./home');
		});
        } else {
          alert('Login Failed');
          console.log(res.status);
        }
      })
      .catch((err) => {
        alert('Login Failed');
        console.log('error occurred', err);
      });
}  
