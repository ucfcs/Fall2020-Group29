export function login(nID, pass) {

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
          res.json().then((res)=> {window.localStorage.setItem('token', res['token']); window.location.href = (window.location + "/home");});
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