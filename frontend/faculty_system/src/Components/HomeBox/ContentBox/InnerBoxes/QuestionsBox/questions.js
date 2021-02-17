export function getQuestions(callback) {
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": window.localStorage.getItem("token")
        },

    };

    fetch("http://127.0.0.1:5000/api/faculty/get_questions", options)
      .then((res)=> {
          if (res.status === 401) {
            res.json().then((res)=> alert(res['message']));
            callback([]);
          } else if (res.status === 200) {
            res.json().then((res)=> {
                //console.log(res["questions"]);
                callback(res["questions"]);
            });
          }
      })
      .catch((err) => {
        alert("Failed to retrieve questions.");
        console.log("error occurred", err);
        callback([]);
      });
}

export function getEntities(callback) {
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": window.localStorage.getItem("token")
        },

    };

    fetch("http://127.0.0.1:5000/api/faculty/get_entities", options)
      .then((res)=> {
          if (res.status === 401) {
            res.json().then((res)=> alert(res['message']));
            callback({});
          } else if (res.status === 200) {
            res.json().then((res)=> {
                callback(res["entities"]);
            });
          }
      })
      .catch((err) => {
        alert("Failed to retrieve entities.");
        console.log("error occurred", err);
        callback({});
      });
}