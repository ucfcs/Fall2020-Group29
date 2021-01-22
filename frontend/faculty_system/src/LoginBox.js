import React from 'react';
import './login.css';

export function LoginBox () {
    
    return (
      <div>
        <h1>
        Knug-Bot Faculty Login
        </h1>
        <div className='login-box'>
          <div className='login-form'>
            <form onSubmit={(e)=>{e.preventDefault(); login()}}>
              <div className='input-group'>
                <label htmlFor='nID'>Account</label>
                <input className='login-text' id='nID' type='text' placeholder='Username: NID' />
              </div>
              <div className='input-group'>
                <label htmlFor='password'>Password</label>
               <input className='login-text' id='password' type='password' placeholder='Password' />
              </div>
              <input className='btn' type='submit' value='Sign On'/>
            </form>
          </div>
        </div>
      </div>
    );
  }

  export default LoginBox;

function login() {

    let nID = document.getElementById('nID').value;
    let pass = document.getElementById('password').value;

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: nID,
            password: pass,
        })
    };
    fetch("http://127.0.0.1:5000/api/faculty/login", options)
      .then((res) => {
        if (res.status === 401) {
          res.json().then((res)=> alert(res['message']));
        } else if (res.status === 200) {
          res.json().then((res)=> {window.localStorage.setItem('token', res['token']); window.location.href = (window.location + "home");});
        } else {
          alert("Login Failed");
          console.log(res.status);
        }
      })
      .catch((err) => {
        alert("Login Failed");
        console.log("error occurred", err);
      });
}  