import React, {useState} from 'react';
import {login} from './loginHandler';
import './login.css';

export function LoginBox () {

    const [nID, setNID] = useState(document.getElementById('nID') === null ? '' : document.getElementById('nID').textContent);
    const [pass, setPass] = useState(document.getElementById('password') === null ? '' : document.getElementById('password').textContent);
    
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
