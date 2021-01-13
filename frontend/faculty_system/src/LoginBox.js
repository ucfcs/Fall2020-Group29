import React, {useState} from 'react';

export function LoginBox () {

    const [nID, setNID] = useState("");
    const [pass, setPass] = useState("");
    
    return (
      <div>
          <form onSubmit={(e)=>{e.preventDefault(); login(nID, pass)}}>
            <label htmlFor='nID'>Account</label>
            <input id='nID' type='text' placeholder='Username: NID' onChange={(e)=>{setNID(e.target.value)}}/>
            <label htmlFor='password'>Password</label>
            <input id='password' type='password' placeholder='Password' onChange={(e)=>{setPass(e.target.value)}}/>
            <input type='submit' value='Sign On'/>
          </form>
       </div>
    );
  }

  export default LoginBox

function login(nID, pass) {
    console.log(nID);
    console.log(pass);

    if (nID === "" || pass === "")
        return;

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
    fetch("http://127.0.0.1:5000/login", options)
      .then((res) => res.json())
      .then((res) => {
          console.log(res)
      })
      .catch((err) => {
        console.log("error occurred", err);
      })
}  