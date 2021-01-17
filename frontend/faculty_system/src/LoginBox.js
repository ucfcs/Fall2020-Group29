import React, {useState} from 'react';
import './login.css';

export function LoginBox () {

    const [nID, setNID] = useState("");
    const [pass, setPass] = useState("");
    
    return (
      <div>
        <h1>
        Knug-Bot Faculty Login
        </h1>
        <div className='login-box'>
          <div className='login-form'>
            <form onSubmit={(e)=>{e.preventDefault(); login(nID, pass)}}>
              <div className='input-group'>
                <label htmlFor='nID'>Account</label>
                <input className='login-text' id='nID' type='text' placeholder='Username: NID' onChange={(e)=>{setNID(e.target.value)}}/>
              </div>
              <div className='input-group'>
                <label htmlFor='password'>Password</label>
               <input className='login-text' id='password' type='password' placeholder='Password' onChange={(e)=>{setPass(e.target.value)}}/>
              </div>
              <input className='btn' type='submit' value='Sign On'/>
            </form>
          </div>
        </div>
      </div>
    );
  }

  export default LoginBox

function login(nID, pass) {
    console.log(nID);
    console.log(pass);

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
    console.log(options);
    fetch("http://127.0.0.1:5000/api/faculty/login", options)
      .then((res) => {
        if (res.status === 401) {
          res.json().then((res)=> alert(res['message']))
        } else {
          res.json().then((res)=> window.localStorage.setItem('token', res['token']))
        }
      })
      .catch((err) => {
        console.log("error occurred", err);
      })
}  